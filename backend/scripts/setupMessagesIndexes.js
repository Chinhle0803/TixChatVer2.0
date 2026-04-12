import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { UpdateTableCommand } from '@aws-sdk/client-dynamodb'
import config from '../src/config/index.js'

const dynamoDBClient = new DynamoDBClient({
  region: config.awsRegion || 'us-east-1',
  credentials: {
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.awsSecretAccessKey,
  },
  ...(config.dynamodbLocal && {
    endpoint: config.dynamodbLocal,
  }),
})

async function setupMessagesIndexes() {
  try {
    console.log('🔧 Setting up DynamoDB messages indexes...\n')

    // Add conversationId-createdAt-index to tixchat-messages table
    console.log('📝 Adding conversationId-createdAt-index to tixchat-messages table...')
    try {
      await dynamoDBClient.send(new UpdateTableCommand({
        TableName: 'tixchat-messages',
        AttributeDefinitions: [
          {
            AttributeName: 'conversationId',
            AttributeType: 'S',
          },
          {
            AttributeName: 'createdAt',
            AttributeType: 'N',
          },
        ],
        GlobalSecondaryIndexUpdates: [
          {
            Create: {
              IndexName: 'conversationId-createdAt-index',
              KeySchema: [
                {
                  AttributeName: 'conversationId',
                  KeyType: 'HASH',
                },
                {
                  AttributeName: 'createdAt',
                  KeyType: 'RANGE',
                },
              ],
              Projection: {
                ProjectionType: 'ALL',
              },
            },
          },
        ],
      }))
      console.log('✅ conversationId-createdAt-index added successfully\n')
    } catch (error) {
      if (error.name === 'ValidationException' && error.message.includes('already exists')) {
        console.log('ℹ️  conversationId-createdAt-index already exists\n')
      } else {
        throw error
      }
    }

    console.log('✨ Messages indexes setup completed!')
  } catch (error) {
    console.error('❌ Error setting up messages indexes:', error.message)
    process.exit(1)
  }
}

setupMessagesIndexes()
