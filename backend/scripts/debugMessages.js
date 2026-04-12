import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
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

async function debugMessages() {
  try {
    console.log('🔍 Scanning all messages in tixchat-messages table...\n')

    // Scan all messages
    const scanResult = await docClient.send(new ScanCommand({
      TableName: 'tixchat-messages',
      Limit: 100,
    }))

    console.log(`📊 Total messages found: ${scanResult.Items?.length || 0}\n`)

    if (scanResult.Items && scanResult.Items.length > 0) {
      // Group by conversationId
      const byConversation = {}
      scanResult.Items.forEach(msg => {
        if (!byConversation[msg.conversationId]) {
          byConversation[msg.conversationId] = []
        }
        byConversation[msg.conversationId].push(msg)
      })

      // Show summary
      Object.entries(byConversation).forEach(([convId, messages]) => {
        console.log(`\n🗂️  Conversation: ${convId}`)
        console.log(`   Messages: ${messages.length}`)
        messages.slice(0, 3).forEach(msg => {
          console.log(`   - ${msg.messageId}: ${msg.content?.substring(0, 50)}... (${new Date(msg.createdAt).toLocaleString()})`)
        })
      })

      // Test query for first conversation
      if (Object.keys(byConversation).length > 0) {
        const testConvId = Object.keys(byConversation)[0]
        console.log(`\n\n🧪 Testing query for conversation: ${testConvId}`)

        const queryResult = await docClient.send(new QueryCommand({
          TableName: 'tixchat-messages',
          IndexName: 'conversationId-createdAt-index',
          KeyConditionExpression: 'conversationId = :conversationId',
          ExpressionAttributeValues: {
            ':conversationId': testConvId,
          },
          ScanIndexForward: false,
          Limit: 50,
        }))

        console.log(`✅ Query returned: ${queryResult.Items?.length || 0} messages`)
        queryResult.Items?.slice(0, 3).forEach(msg => {
          console.log(`   - ${msg.messageId}: ${msg.content?.substring(0, 50)}... (${new Date(msg.createdAt).toLocaleString()})`)
        })
      }
    } else {
      console.log('❌ No messages found in table!')
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

debugMessages()
