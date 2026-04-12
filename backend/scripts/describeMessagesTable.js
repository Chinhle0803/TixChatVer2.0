import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DescribeTableCommand } from '@aws-sdk/client-dynamodb'
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

async function describeTable() {
  try {
    const result = await client.send(new DescribeTableCommand({
      TableName: 'tixchat-messages',
    }))

    console.log('📊 Table: tixchat-messages')
    console.log('\n🔑 Key Schema:')
    result.Table.KeySchema.forEach(key => {
      console.log(`   ${key.AttributeName} (${key.KeyType})`)
    })

    console.log('\n📋 Attributes:')
    result.Table.AttributeDefinitions.forEach(attr => {
      console.log(`   ${attr.AttributeName}: ${attr.AttributeType}`)
    })

    console.log('\n📑 Global Secondary Indexes:')
    if (result.Table.GlobalSecondaryIndexes && result.Table.GlobalSecondaryIndexes.length > 0) {
      result.Table.GlobalSecondaryIndexes.forEach(gsi => {
        console.log(`\n   ${gsi.IndexName}:`)
        gsi.KeySchema.forEach(key => {
          console.log(`      ${key.AttributeName} (${key.KeyType})`)
        })
      })
    } else {
      console.log('   None')
    }

    console.log('\n✅ Billing Mode:', result.Table.BillingModeSummary?.BillingMode)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

describeTable()
