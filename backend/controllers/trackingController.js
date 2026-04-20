const supabase = require('../services/supabaseClient');

/**
 * Helper to log any activity to the activity_logs table
 */
async function logActivity(productId, action, user) {
    try {
        await supabase
            .from('activity_logs')
            .insert([{
                product_id: productId,
                action: action,
                performed_by: user ? user.name : 'Unknown',
                role: user ? user.role : 'System'
            }]);
    } catch (err) {
        console.error('Logging Error:', err);
    }
}

exports.createTracking = async (req, res) => {
    try {
        const { productId, productName, dateOfSowing } = req.body;

        // Validation
        if (!productId || !productName || !dateOfSowing) {
            return res.status(400).json({ msg: 'Please provide Product ID, Product Name, and Date of Sowing' });
        }

        const farmerId = req.user ? req.user.id : null;
        const farmerName = req.user ? req.user.name : null;

        if (!farmerId) {
            return res.status(401).json({ msg: 'User ID missing. Please log in again.' });
        }

        const { data, error } = await supabase
            .from('product_tracking')
            .insert([{
                product_id: productId,
                product_name: productName,
                farmer_id: farmerId,
                farmer_name: farmerName,
                date_of_sowing: dateOfSowing,
                status: 'Sown'
            }])
            .select()
            .single();

        if (error) {
            console.error("Supabase Error:", error);
            if (error.code === '23505') return res.status(400).json({ msg: 'Product ID already exists in tracking' });
            throw error;
        }

        // Map snake_case to camelCase for frontend consistency
        const track = mapTrack(data);
        
        // Log the activity
        await logActivity(productId, `Initialized Sowing: ${productName}`, req.user);
        
        res.status(201).json({ msg: 'Product tracking initialized', track });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.updateHarvest = async (req, res) => {
    try {
        const { productId } = req.params;
        const { dateOfHarvesting } = req.body;

        if (!dateOfHarvesting) {
            return res.status(400).json({ msg: 'Date of Harvesting is required' });
        }

        const { data, error } = await supabase
            .from('product_tracking')
            .update({
                date_of_harvesting: dateOfHarvesting,
                status: 'Harvested',
                updated_at: new Date().toISOString()
            })
            .eq('product_id', productId)
            .select()
            .single();

        if (error || !data) return res.status(404).json({ msg: 'Product not found' });
        
        // Log the activity
        await logActivity(productId, 'Logged Harvesting Date', req.user);
        
        res.json({ msg: 'Harvesting date updated', track: mapTrack(data) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.updateIndustry = async (req, res) => {
    try {
        const { productId } = req.params;
        const { dateOfProcessing, dateOfPacking } = req.body;

        if (!dateOfProcessing && !dateOfPacking) {
            return res.status(400).json({ msg: 'At least one date (Processing or Packing) is required' });
        }

        const industryId = req.user ? req.user.id : null;
        const industryName = req.user ? req.user.name : null;

        const updateData = {
            industry_id: industryId,
            industry_name: industryName,
            updated_at: new Date().toISOString()
        };

        if (dateOfProcessing) {
            updateData.date_of_processing = dateOfProcessing;
            updateData.status = 'Processed';
        }
        if (dateOfPacking) {
            updateData.date_of_packing = dateOfPacking;
            updateData.status = 'Packed';
        }

        const { data, error } = await supabase
            .from('product_tracking')
            .update(updateData)
            .eq('product_id', productId)
            .select()
            .single();

        if (error || !data) return res.status(404).json({ msg: 'Product not found' });
        
        // Log the activity
        const actionStr = [dateOfProcessing && 'Processing', dateOfPacking && 'Packing'].filter(Boolean).join(' & ');
        await logActivity(productId, `Updated Industry Stages: ${actionStr}`, req.user);
        
        res.json({ msg: 'Industry stage updated', track: mapTrack(data) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.updateTransport = async (req, res) => {
    try {
        const { productId } = req.params;
        const { dateOfShipping, dateOfDelivery } = req.body;

        if (!dateOfShipping && !dateOfDelivery) {
            return res.status(400).json({ msg: 'At least one date (Shipping or Delivery) is required' });
        }

        const transporterId = req.user ? req.user.id : null;
        const transporterName = req.user ? req.user.name : null;

        const updateData = {
            transporter_id: transporterId,
            transporter_name: transporterName,
            updated_at: new Date().toISOString()
        };

        if (dateOfShipping) {
            updateData.date_of_shipping = dateOfShipping;
            updateData.status = 'Shipped';
        }
        if (dateOfDelivery) {
            updateData.date_of_delivery = dateOfDelivery;
            updateData.status = 'Delivered';
        }

        const { data, error } = await supabase
            .from('product_tracking')
            .update(updateData)
            .eq('product_id', productId)
            .select()
            .single();

        if (error || !data) return res.status(404).json({ msg: 'Product not found' });
        
        // Log the activity
        const actionStr = [dateOfShipping && 'Shipping', dateOfDelivery && 'Delivery'].filter(Boolean).join(' & ');
        await logActivity(productId, `Updated Logistics Stages: ${actionStr}`, req.user);
        
        res.json({ msg: 'Transport stage updated', track: mapTrack(data) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.getTrackingHistory = async (req, res) => {
    try {
        const { productId } = req.params;
        const { data, error } = await supabase
            .from('product_tracking')
            .select('*')
            .eq('product_id', productId)
            .maybeSingle();
        
        if (error || !data) return res.status(404).json({ msg: 'Tracking record not found' });
        
        res.json({ track: mapTrack(data) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.getAllTracking = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('product_tracking')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const tracks = data.map(t => mapTrack(t));
        res.json(tracks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.getActivityLogs = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('activity_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(50);
        
        if (error) throw error;
        
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

/**
 * Helper to map snake_case SQL results to camelCase for the frontend
 */
function mapTrack(data) {
    if (!data) return null;
    return {
        id: data.id,
        productId: data.product_id,
        productName: data.product_name,
        farmerId: data.farmer_id,
        farmerName: data.farmer_name,
        dateOfSowing: data.date_of_sowing,
        dateOfHarvesting: data.date_of_harvesting,
        industryId: data.industry_id,
        industryName: data.industry_name,
        dateOfProcessing: data.date_of_processing,
        dateOfPacking: data.date_of_packing,
        transporterId: data.transporter_id,
        transporterName: data.transporter_name,
        dateOfShipping: data.date_of_shipping,
        dateOfDelivery: data.date_of_delivery,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
    };
}
