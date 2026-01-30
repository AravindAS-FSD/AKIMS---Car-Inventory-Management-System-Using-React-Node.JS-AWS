const AWS = require('aws-sdk');
const { verifyToken } = require('./verifyToken');

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization"
  };

  try {
    verifyToken(event);
    let result;
    try {
      result = await dynamo.scan({ TableName: 'Categories' }).promise();
    } catch (scanErr) {
      console.error('DynamoDB scan error:', scanErr);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: 'DynamoDB scan error', error: scanErr.message })
      };
    }

    try {
      // Reconstruct hierarchy from flat items
      const items = result.Items || [];
      const categories = items.filter(item => item.type === 'category');
      const subcategories = items.filter(item => item.type === 'subcategory');

      // Attach subcategories to categories
      categories.forEach(cat => {
        cat.subcategories = subcategories.filter(sub => sub.parentId === cat.id);
      });

      // Sort categories by createdAt descending (most recent first)
      categories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(categories)
      };
    } catch (hierarchyErr) {
      console.error('Hierarchy reconstruction error:', hierarchyErr);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: 'Hierarchy reconstruction error', error: hierarchyErr.message })
      };
    }
  } catch (err) {
    console.error('General getCategories error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Server error', error: err.message })
    };
  }
};
