const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const supabase = require('../services/supabaseClient');

const getContract = () => {
    try {
        const contractPath = path.join(__dirname, '../config/contractAddress.json');
        const artifactPath = path.join(__dirname, '../config/SupplyChain.json');
        
        if (!fs.existsSync(contractPath) || !fs.existsSync(artifactPath)) {
            console.error("Contract config files missing.");
            return null;
        }

        const { address } = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
        const { abi } = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

        const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545'); // Hardhat node
        const wallet = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider); 
        const contract = new ethers.Contract(address, abi, wallet);
        
        return contract;
    } catch (e) {
        console.error("Error init contract:", e);
        return null;
    }
};

exports.addProduct = async (req, res) => {
    try {
        const { productId, cropName, quantityText, farmerLocation } = req.body;

        const { data: product, error } = await supabase
            .from('products')
            .insert([{
                product_id: productId,
                crop_name: cropName,
                quantity_text: quantityText,
                farmer_location: farmerLocation,
                current_status: 'Created'
            }])
            .select()
            .single();

        if (error) {
            console.error("DB Insert Error:", error);
            if(error.code === '23505') return res.status(400).json({ msg: 'Product ID already exists' });
            throw error;
        }

        const contract = getContract();
        if (contract) {
            try {
                const tx = await contract.addFarmerDetails(
                    cropName,
                    new Date().toISOString(), 
                    new Date().toISOString(), 
                    farmerLocation,
                    quantityText,
                    "N/A" 
                );
                await tx.wait(); 
                console.log("Transaction confirmed on blockchain:", tx.hash);
            } catch (e) {
                console.error("Failed to write to blockchain:", e);
            }
        }

        // Remap to frontend expectations
        const mappedProduct = {
            ...product,
            productId: product.product_id,
            cropName: product.crop_name,
            quantityText: product.quantity_text,
            farmerLocation: product.farmer_location,
            currentStatus: product.current_status
        };

        res.json(mappedProduct);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.processProduct = async (req, res) => {
    try {
        const { batchId } = req.body;
        const productId = req.params.productId;

        const { data: product, error: findError } = await supabase
            .from('products')
            .select('*')
            .eq('product_id', productId)
            .single();

        if (findError || !product) return res.status(404).json({ msg: 'Product not found' });
        if (product.current_status !== 'Created') return res.status(400).json({ msg: 'Invalid state transition' });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const qrCodeUrl = `${frontendUrl}/trace/${batchId}`;

        const { data: updatedProduct, error: updateError } = await supabase
            .from('products')
            .update({
                batch_id: batchId,
                current_status: 'Processed',
                qr_code_url: qrCodeUrl
            })
            .eq('product_id', productId)
            .select()
            .single();

        if (updateError) throw updateError;

        const contract = getContract();
        if (contract) {
            try {
                const tx = await contract.addIndustryDetails(
                    productId,
                    batchId,
                    product.crop_name + " Processed",
                    new Date().toISOString()
                );
                await tx.wait();
                console.log("Industry tx confirmed:", tx.hash);
            } catch (e) {
                console.error("Blockchain error:", e);
            }
        }

        const mappedProduct = {
            ...updatedProduct,
            productId: updatedProduct.product_id,
            cropName: updatedProduct.crop_name,
            quantityText: updatedProduct.quantity_text,
            farmerLocation: updatedProduct.farmer_location,
            currentStatus: updatedProduct.current_status,
            batchId: updatedProduct.batch_id,
            qrCodeUrl: updatedProduct.qr_code_url
        };

        res.json(mappedProduct);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.shipProduct = async (req, res) => {
    try {
        const productId = req.params.productId;

        const { data: product, error: findError } = await supabase
            .from('products')
            .select('*')
            .eq('product_id', productId)
            .single();

        if (findError || !product) return res.status(404).json({ msg: 'Product not found' });
        if (product.current_status !== 'Processed') return res.status(400).json({ msg: 'Invalid state transition' });

        const { data: updatedProduct, error: updateError } = await supabase
            .from('products')
            .update({ current_status: 'Shipped' })
            .eq('product_id', productId)
            .select()
            .single();

        if (updateError) throw updateError;

        const contract = getContract();
        if (contract) {
            try {
                const tx = await contract.addTransportDetails(
                    productId,
                    "TRANSPORT-01",
                    new Date().toISOString(),
                    new Date(Date.now() + 86400000).toISOString(), 
                    "Dry"
                );
                await tx.wait();
                console.log("Transport tx confirmed:", tx.hash);
            } catch (e) {
                console.error("Blockchain error:", e);
            }
        }

        const mappedProduct = {
            ...updatedProduct,
            productId: updatedProduct.product_id,
            cropName: updatedProduct.crop_name,
            quantityText: updatedProduct.quantity_text,
            farmerLocation: updatedProduct.farmer_location,
            currentStatus: updatedProduct.current_status,
            batchId: updatedProduct.batch_id,
            qrCodeUrl: updatedProduct.qr_code_url
        };

        res.json(mappedProduct);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.receiveProduct = async (req, res) => {
    try {
        const productId = req.params.productId;

        const { data: product, error: findError } = await supabase
            .from('products')
            .select('*')
            .eq('product_id', productId)
            .single();

        if (findError || !product) return res.status(404).json({ msg: 'Product not found' });
        if (product.current_status !== 'Shipped') return res.status(400).json({ msg: 'Invalid state transition' });

        const { data: updatedProduct, error: updateError } = await supabase
            .from('products')
            .update({ current_status: 'Received' })
            .eq('product_id', productId)
            .select()
            .single();

        if (updateError) throw updateError;

        const contract = getContract();
        if (contract) {
            try {
                const tx = await contract.addRetailDetails(
                    productId,
                    "Retail Store 1",
                    "City Center",
                    "N/A"
                );
                await tx.wait();
                console.log("Retail tx confirmed:", tx.hash);
            } catch (e) {
                console.error("Blockchain error:", e);
            }
        }

        const mappedProduct = {
            ...updatedProduct,
            productId: updatedProduct.product_id,
            cropName: updatedProduct.crop_name,
            quantityText: updatedProduct.quantity_text,
            farmerLocation: updatedProduct.farmer_location,
            currentStatus: updatedProduct.current_status,
            batchId: updatedProduct.batch_id,
            qrCodeUrl: updatedProduct.qr_code_url
        };

        res.json(mappedProduct);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedProducts = products.map(product => ({
            ...product,
            productId: product.product_id,
            cropName: product.crop_name,
            quantityText: product.quantity_text,
            farmerLocation: product.farmer_location,
            currentStatus: product.current_status,
            batchId: product.batch_id,
            qrCodeUrl: product.qr_code_url
        }));

        res.json(mappedProducts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.traceProduct = async (req, res) => {
    try {
        const batchId = req.params.batchId;

        const { data: product, error: findError } = await supabase
            .from('products')
            .select('*')
            .eq('batch_id', batchId)
            .maybeSingle();

        if (findError || !product) return res.status(404).json({ msg: 'Product not found' });
        
        const mappedProduct = {
            ...product,
            productId: product.product_id,
            cropName: product.crop_name,
            quantityText: product.quantity_text,
            farmerLocation: product.farmer_location,
            currentStatus: product.current_status,
            batchId: product.batch_id,
            qrCodeUrl: product.qr_code_url
        };

        let onChainData = null;
        const contract = getContract();
        if (contract) {
            try {
                const data = await contract.getProductByBatchId(batchId);
                onChainData = {
                    farmer: data.farmer,
                    cropName: data.cropName,
                    harvestDate: data.harvestDate,
                    industry: data.industry,
                    processingDate: data.processingDate,
                    transporter: data.transporter,
                    shipmentDate: data.shipmentDate,
                    retailer: data.retailer,
                    storeName: data.storeName
                }
            } catch (e) {
                console.error("Blockchain read error:", e);
            }
        }

        res.json({ product: mappedProduct, onChainData });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.addTransaction = async (req, res) => {
    try {
        const { transactionId, amount, type, paymentMethod, productId } = req.body;
        let { farmerId, industryId } = req.body;

        // Note: For actual lookup of userID to UUID from JWT context ID. 
        // We assume req.user.id is the UUID of the user in Supabase.
        if (!farmerId && req.user.role === 'Farmer') {
            farmerId = req.user.id;
        }
        if (!industryId && req.user.role === 'Industry') {
            industryId = req.user.id;
        }

        // 1. Exact Transaction ID check as per feature request:
        // Before inserting a transaction: Check if transaction_id already exists in Supabase
        const { data: existingTransaction } = await supabase
            .from('transactions')
            .select('id')
            .eq('transaction_id', transactionId)
            .maybeSingle();

        if (existingTransaction) {
            return res.status(400).json({ msg: 'Duplicate Payment' });
        }

        // 2. Fuzzy Duplicate check
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        
        let query = supabase
            .from('transactions')
            .select('id')
            .eq('product_id', productId)
            .eq('amount', amount)
            .gte('created_at', fiveMinutesAgo);
            
        if (farmerId) query = query.eq('farmer_id', farmerId);
        if (industryId) query = query.eq('industry_id', industryId);

        const { data: fuzzyDuplicate } = await query;
        if (fuzzyDuplicate && fuzzyDuplicate.length > 0) {
            return res.status(400).json({ msg: 'Duplicate Payment' }); // unified duplicate payment error
        }

        const { data: transaction, error: insertError } = await supabase
            .from('transactions')
            .insert([{
                transaction_id: transactionId,
                farmer_id: farmerId || null,
                industry_id: industryId || null,
                product_id: productId,
                amount,
                type,
                payment_method: paymentMethod
            }])
            .select()
            .single();

        if (insertError) throw insertError;

        const mappedTx = {
            ...transaction,
            transactionId: transaction.transaction_id,
            farmerId: transaction.farmer_id,
            industryId: transaction.industry_id,
            productId: transaction.product_id,
            paymentMethod: transaction.payment_method
        };

        res.json({ msg: 'Transaction recorded successfully', transaction: mappedTx });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};
