const AWS = require('aws-sdk');
const { verifyToken } = require('./verifyToken');
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization"
  };

  try {
    const user = verifyToken(event);

    if (user.role !== 'admin') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ message: 'Only admin can delete categories' })
      };
    }

    const { id } = event.pathParameters;
    const { type } = event.queryStringParameters || {};

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Missing ID' })
      };
    }

    if (type === 'category') {
      // Find all items: category + subcategories
      const result = await dynamo.scan({ TableName: 'Categories' }).promise();
      const allItems = result.Items || [];

      const itemsToDelete = allItems
        .filter(item => item.id === id || item.parentId === id)
        .map(item => ({
          DeleteRequest: { Key: { id: item.id } }
        }));

      if (itemsToDelete.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Category or its subcategories not found' })
        };
      }

      // Batch delete (max 25 per batch)
      const chunks = [];
      while (itemsToDelete.length) {
        chunks.push(itemsToDelete.splice(0, 25));
      }

      for (const chunk of chunks) {
        await dynamo.batchWrite({
          RequestItems: { Categories: chunk }
        }).promise();
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Category and its subcategories deleted successfully' })
      };
    } else {
      // Subcategory or any single item by ID
      await dynamo.delete({
        TableName: 'Categories',
        Key: { id }
      }).promise();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Subcategory deleted successfully' })
      };
    }

  } catch (err) {
    console.error('Delete Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: err.message || 'Internal server error' })
    };
  }
};
