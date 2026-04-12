import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DeleteTableCommand, CreateTableCommand, DescribeTableCommand, waitUntilTableNotExists, waitUntilTableExists } from '@aws-sdk/client-dynamodb'
import config from '../src/config/index.js'

const client = new DynamoDBClient({
  region: config.awsRegion || 'us-east-1',
  credentials: {
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.awsSecretAccessKey,
  },
  ...(config.dynamodbLocal && {
    endpoint: config.dynamodbLocal,
  }),
})

async function recreateMessagesTable() {
  try {
    console.log('🔧 Recreating tixchat-messages table with correct schema...\n')

    // Check if table exists
    console.log('📋 Checking if table exists...')
    try {
      await client.send(new DescribeTableCommand({
        TableName: 'tixchat-messages',
      }))
      console.log('✅ Table exists, deleting it...')

      // Delete table
      await client.send(new DeleteTableCommand({
        TableName: 'tixchat-messages',
      }))

      // Wait for table to be deleted
      await waitUntilTableNotExists({
        client,
        maxWaitTime: 60,
      }, {
        TableName: 'tixchat-messages',
      })
      console.log('✅ Table deleted\n')
    } catch (err) {
      if (err.name === 'ResourceNotFoundException') {
        console.log('ℹ️  Table does not exist\n')
      } else {
        throw err
      }
    }

    // Create new table with correct schema
    console.log('📝 Creating new tixchat-messages table...')
    await client.send(new CreateTableCommand({
      TableName: 'tixchat-messages',
      AttributeDefinitions: [
        {
          AttributeName: 'conversationId',
          AttributeType: 'S',
        },
        {
          AttributeName: 'messageId',
          AttributeType: 'S',
        },
        {
          AttributeName: 'createdAt',
          AttributeType: 'N',
        },
      ],
      KeySchema: [
        {
          AttributeName: 'conversationId',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'messageId',
          KeyType: 'RANGE',
        },
      ],
      GlobalSecondaryIndexes: [
        {
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
      ],
      BillingMode: 'PAY_PER_REQUEST',
    }))

    // Wait for table to be created
    await waitUntilTableExists({
      client,
      maxWaitTime: 60,
    }, {
      TableName: 'tixchat-messages',
    })

    console.log('✅ tixchat-messages table created successfully!\n')
    console.log('📊 Table schema:')
    console.log('   Primary Key: conversationId (HASH) + messageId (RANGE)')
    console.log('   Index: conversationId-createdAt-index (HASH: conversationId, RANGE: createdAt)')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

recreateMessagesTable()
