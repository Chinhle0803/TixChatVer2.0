import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
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

const docClient = DynamoDBDocumentClient.from(client)

async function cleanupMessages() {
  try {
    console.log('🔍 Scanning for messages without senderId...\n')

    const scanResult = await docClient.send(new ScanCommand({
      TableName: 'tixchat-messages',
      Limit: 1000,
    }))

    const badMessages = scanResult.Items?.filter(msg => !msg.senderId && !msg.userId) || []
    console.log(`Found ${badMessages.length} messages without senderId/userId\n`)

    for (const msg of badMessages) {
      console.log(`🗑️  Deleting message: ${msg.messageId}`)
      await docClient.send(new DeleteCommand({
        TableName: 'tixchat-messages',
        Key: {
          messageId: msg.messageId,
        },
      }))
    }

    console.log(`\n✅ Cleanup completed! Deleted ${badMessages.length} messages`)
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

cleanupMessages()
