import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
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

async function debugAllTables() {
  try {
    const tables = ['tixchat-messages', 'tixchat-conversations', 'tixchat-participants', 'tixchat-users']

    for (const tableName of tables) {
      console.log(`\n📊 Table: ${tableName}`)
      try {
        const result = await docClient.send(new ScanCommand({
          TableName: tableName,
          Limit: 100,
        }))

        const count = result.Items?.length || 0
        console.log(`   Items: ${count}`)

        if (count > 0 && tableName === 'tixchat-messages') {
          console.log('\n   Sample messages:')
          result.Items?.slice(0, 5).forEach(msg => {
            console.log(`   - messageId: ${msg.messageId}`)
            console.log(`     conversationId: ${msg.conversationId}`)
            console.log(`     content: ${msg.content?.substring(0, 40)}...`)
            console.log(`     createdAt: ${msg.createdAt}`)
            console.log(`     userId: ${msg.userId}`)
            console.log()
          })
        }
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}`)
      }
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

debugAllTables()
