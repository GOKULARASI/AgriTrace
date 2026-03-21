// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SupplyChain {
    enum Status { Created, Processed, Shipped, Received }

    struct Product {
        uint256 id;
        string batchId; // assigned by industry
        Status status;

        // Farmer Details
        address farmer;
        string cropName;
        string sowingDate;
        string harvestDate;
        string farmerLocation;
        string quantity;
        string farmerPrice;

        // Industry Details
        address industry;
        string processedProductName;
        string processingDate;

        // Transport Details
        address transporter;
        string vehicleNo;
        string shipmentDate;
        string expectedArrivalDate;
        string tempConditions;

        // Retail Details
        address retailer;
        string storeName;
        string storeLocation;
        string retailSellingPrice;
    }

    uint256 public productCount = 0;
    mapping(uint256 => Product) public products;
    mapping(string => uint256) public batchIdToProductId;

    event FarmerAdded(uint256 indexed productId, address indexed farmer, string cropName);
    event IndustryProcessed(uint256 indexed productId, string batchId, address indexed industry);
    event TransportShipped(uint256 indexed productId, address indexed transporter, string vehicleNo);
    event RetailReceived(uint256 indexed productId, address indexed retailer, string storeName);

    // 1. Farmer adds product
    function addFarmerDetails(
        string memory _cropName,
        string memory _sowingDate,
        string memory _harvestDate,
        string memory _farmerLocation,
        string memory _quantity,
        string memory _farmerPrice
    ) public {
        productCount++;
        Product storage prod = products[productCount];
        prod.id = productCount;
        prod.farmer = msg.sender;
        prod.cropName = _cropName;
        prod.sowingDate = _sowingDate;
        prod.harvestDate = _harvestDate;
        prod.farmerLocation = _farmerLocation;
        prod.quantity = _quantity;
        prod.farmerPrice = _farmerPrice;
        prod.status = Status.Created;

        emit FarmerAdded(productCount, msg.sender, _cropName);
    }

    // 2. Industry processing
    function addIndustryDetails(
        uint256 _productId,
        string memory _batchId,
        string memory _processedProductName,
        string memory _processingDate
    ) public {
        require(_productId > 0 && _productId <= productCount, "Invalid Product ID");
        Product storage prod = products[_productId];
        require(prod.status == Status.Created, "Product not in Created state");

        prod.industry = msg.sender;
        prod.batchId = _batchId;
        prod.processedProductName = _processedProductName;
        prod.processingDate = _processingDate;
        prod.status = Status.Processed;

        batchIdToProductId[_batchId] = _productId;

        emit IndustryProcessed(_productId, _batchId, msg.sender);
    }

    // 3. Transport details
    function addTransportDetails(
        uint256 _productId,
        string memory _vehicleNo,
        string memory _shipmentDate,
        string memory _expectedArrivalDate,
        string memory _tempConditions
    ) public {
        require(_productId > 0 && _productId <= productCount, "Invalid Product ID");
        Product storage prod = products[_productId];
        require(prod.status == Status.Processed, "Product not in Processed state");

        prod.transporter = msg.sender;
        prod.vehicleNo = _vehicleNo;
        prod.shipmentDate = _shipmentDate;
        prod.expectedArrivalDate = _expectedArrivalDate;
        prod.tempConditions = _tempConditions;
        prod.status = Status.Shipped;

        emit TransportShipped(_productId, msg.sender, _vehicleNo);
    }

    // 4. Retail details
    function addRetailDetails(
        uint256 _productId,
        string memory _storeName,
        string memory _storeLocation,
        string memory _retailSellingPrice
    ) public {
        require(_productId > 0 && _productId <= productCount, "Invalid Product ID");
        Product storage prod = products[_productId];
        require(prod.status == Status.Shipped, "Product not in Shipped state");

        prod.retailer = msg.sender;
        prod.storeName = _storeName;
        prod.storeLocation = _storeLocation;
        prod.retailSellingPrice = _retailSellingPrice;
        prod.status = Status.Received;

        emit RetailReceived(_productId, msg.sender, _storeName);
    }

    // Get product details
    function getProduct(uint256 _productId) public view returns (Product memory) {
        require(_productId > 0 && _productId <= productCount, "Invalid Product ID");
        return products[_productId];
    }
    
    // Get product by batch id
    function getProductByBatchId(string memory _batchId) public view returns (Product memory) {
        uint256 productId = batchIdToProductId[_batchId];
        require(productId > 0, "Invalid Batch ID");
        return products[productId];
    }
}
