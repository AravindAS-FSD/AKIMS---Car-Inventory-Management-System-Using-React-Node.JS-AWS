const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { verifyToken } = require('./verifyToken');
const { logAction } = require('./logAction');
const cloudinary = require('cloudinary').v2;

const dynamo = new AWS.DynamoDB.DocumentClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization"
  };

  try {
    const user = verifyToken(event);
    if (user.role !== 'admin' && user.role !== 'staff') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ message: 'Only admin or staff can add products' })
      };
    }

    const { name, category, subcategory, supplier, imageUrl } = JSON.parse(event.body);

    if (!name || !category || !subcategory || !supplier || !imageUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Missing required product fields' })
      };
    }

    const uploadRes = await cloudinary.uploader.upload(imageUrl, {
      folder: 'products',
      upload_preset: 'ak_inventory_products' 
    });

    const product = {
      id: uuidv4(),
      name,
      category,
      subcategory,
      supplier,
      quantity: 0,
      imageUrl: uploadRes.secure_url,
      createdAt: new Date().toISOString()
    };

    await dynamo.put({
      TableName: 'Products',
      Item: product
    }).promise();

    await logAction({
      action: 'Added',
      product: name,
      quantity: 0,
      user: user.username
    });

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ message: 'Product added', product })
    };

  } catch (err) {
    console.error('Add Product Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: err.message || 'Internal Server Error' })
    };
  }
};
