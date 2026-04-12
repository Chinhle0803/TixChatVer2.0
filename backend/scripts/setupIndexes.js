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

async function setupIndexes() {
  try {
    console.log('🔧 Setting up DynamoDB indexes...\n')

    // ========== tixchat-users indexes ==========
    console.log('📊 Setting up tixchat-users indexes...')

    // Add email-index to tixchat-users table
    console.log('📝 Adding email-index to tixchat-users table...')
    try {
      await dynamoDBClient.send(new UpdateTableCommand({
        TableName: 'tixchat-users',
        AttributeDefinitions: [
          {
            AttributeName: 'email',
            AttributeType: 'S',
          },
        ],
        GlobalSecondaryIndexUpdates: [
          {
            Create: {
              IndexName: 'email-index',
              KeySchema: [
                {
                  AttributeName: 'email',
                  KeyType: 'HASH',
                },
              ],
              Projection: {
                ProjectionType: 'ALL',
              },
              ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
              },
            },
          },
        ],
      }))
      console.log('✅ email-index added successfully\n')
    } catch (error) {
      if (error.name === 'ValidationException' && error.message.includes('already exists')) {
        console.log('ℹ️  email-index already exists\n')
      } else {
        throw error
      }
    }

    // Add username-index to tixchat-users table
    console.log('📝 Adding username-index to tixchat-users table...')
    try {
      await dynamoDBClient.send(new UpdateTableCommand({
        TableName: 'tixchat-users',
        AttributeDefinitions: [
          {
            AttributeName: 'username',
            AttributeType: 'S',
          },
        ],
        GlobalSecondaryIndexUpdates: [
          {
            Create: {
              IndexName: 'username-index',
              KeySchema: [
                {
                  AttributeName: 'username',
                  KeyType: 'HASH',
                },
              ],
              Projection: {
                ProjectionType: 'ALL',
              },
              ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
              },
            },
          },
        ],
      }))
      console.log('✅ username-index added successfully\n')
    } catch (error) {
      if (error.name === 'ValidationException' && error.message.includes('already exists')) {
        console.log('ℹ️  username-index already exists\n')
      } else {
        throw error
      }
    }

    // ========== tixchat-conversations indexes ==========
    console.log('📊 Setting up tixchat-conversations indexes...')

    // Add participants-index to tixchat-conversations table
    console.log('📝 Adding participants-index to tixchat-conversations table...')
    try {
      await dynamoDBClient.send(new UpdateTableCommand({
        TableName: 'tixchat-conversations',
        AttributeDefinitions: [
          {
            AttributeName: 'participants',
            AttributeType: 'S',
          },
        ],
        GlobalSecondaryIndexUpdates: [
          {
            Create: {
              IndexName: 'participants-index',
              KeySchema: [
                {
                  AttributeName: 'participants',
                  KeyType: 'HASH',
                },
              ],
              Projection: {
                ProjectionType: 'ALL',
              },
              ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
              },
            },
          },
        ],
      }))
      console.log('✅ participants-index added successfully\n')
    } catch (error) {
      if (error.name === 'ValidationException' && error.message.includes('already exists')) {
        console.log('ℹ️  participants-index already exists\n')
      } else {
        throw error
      }
    }

    // ========== tixchat-messages indexes ==========
    console.log('📊 Setting up tixchat-messages indexes...')

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

    // Add senderId-index to tixchat-messages table
    console.log('📝 Adding senderId-index to tixchat-messages table...')
    try {
      await dynamoDBClient.send(new UpdateTableCommand({
        TableName: 'tixchat-messages',
        AttributeDefinitions: [
          {
            AttributeName: 'senderId',
            AttributeType: 'S',
          },
        ],
        GlobalSecondaryIndexUpdates: [
          {
            Create: {
              IndexName: 'senderId-index',
              KeySchema: [
                {
                  AttributeName: 'senderId',
                  KeyType: 'HASH',
                },
              ],
              Projection: {
                ProjectionType: 'ALL',
              },
            },
          },
        ],
      }))
      console.log('✅ senderId-index added successfully\n')
    } catch (error) {
      if (error.name === 'ValidationException' && error.message.includes('already exists')) {
        console.log('ℹ️  senderId-index already exists\n')
      } else {
        throw error
      }
    }

    // ========== tixchat-participants indexes ==========
    console.log('📊 Setting up tixchat-participants indexes...')

    // Add conversationId-index to tixchat-participants table
    console.log('📝 Adding conversationId-index to tixchat-participants table...')
    try {
      await dynamoDBClient.send(new UpdateTableCommand({
        TableName: 'tixchat-participants',
        AttributeDefinitions: [
          {
            AttributeName: 'conversationId',
            AttributeType: 'S',
          },
        ],
        GlobalSecondaryIndexUpdates: [
          {
            Create: {
              IndexName: 'conversationId-index',
              KeySchema: [
                {
                  AttributeName: 'conversationId',
                  KeyType: 'HASH',
                },
              ],
              Projection: {
                ProjectionType: 'ALL',
              },
              ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
              },
            },
          },
        ],
      }))
      console.log('✅ conversationId-index added successfully\n')
    } catch (error) {
      if (error.name === 'ValidationException' && error.message.includes('already exists')) {
        console.log('ℹ️  conversationId-index already exists\n')
      } else {
        throw error
      }
    }

    // Add conversationId-userId-index to tixchat-participants table
    console.log('📝 Adding conversationId-userId-index to tixchat-participants table...')
    try {
      await dynamoDBClient.send(new UpdateTableCommand({
        TableName: 'tixchat-participants',
        AttributeDefinitions: [
          {
            AttributeName: 'conversationId',
            AttributeType: 'S',
          },
          {
            AttributeName: 'userId',
            AttributeType: 'S',
          },
        ],
        GlobalSecondaryIndexUpdates: [
          {
            Create: {
              IndexName: 'conversationId-userId-index',
              KeySchema: [
                {
                  AttributeName: 'conversationId',
                  KeyType: 'HASH',
                },
                {
                  AttributeName: 'userId',
                  KeyType: 'RANGE',
                },
              ],
              Projection: {
                ProjectionType: 'ALL',
              },
              ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
              },
            },
          },
        ],
      }))
      console.log('✅ conversationId-userId-index added successfully\n')
    } catch (error) {
      if (error.name === 'ValidationException' && error.message.includes('already exists')) {
        console.log('ℹ️  conversationId-userId-index already exists\n')
      } else {
        throw error
      }
    }

    // Add userId-index to tixchat-participants table
    console.log('📝 Adding userId-index to tixchat-participants table...')
    try {
      await dynamoDBClient.send(new UpdateTableCommand({
        TableName: 'tixchat-participants',
        AttributeDefinitions: [
          {
            AttributeName: 'userId',
            AttributeType: 'S',
          },
        ],
        GlobalSecondaryIndexUpdates: [
          {
            Create: {
              IndexName: 'userId-index',
              KeySchema: [
                {
                  AttributeName: 'userId',
                  KeyType: 'HASH',
                },
              ],
              Projection: {
                ProjectionType: 'ALL',
              },
              ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
              },
            },
          },
        ],
      }))
      console.log('✅ userId-index added successfully\n')
    } catch (error) {
      if (error.name === 'ValidationException' && error.message.includes('already exists')) {
        console.log('ℹ️  userId-index already exists\n')
      } else {
        throw error
      }
    }

    console.log('✨ All indexes setup completed successfully!')
  } catch (error) {
    console.error('❌ Error setting up indexes:', error.message)
    process.exit(1)
  }
}

setupIndexes()
