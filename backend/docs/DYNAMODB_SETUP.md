# AWS DynamoDB Setup - Manual Instructions

## Quick Setup with AWS CLI

If you have AWS CLI installed, you can run these commands to create the tables with indexes.

### 1. Create Users Table with Indexes

```bash
aws dynamodb create-table \
  --table-name tixchat-users \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=email,AttributeType=S \
    AttributeName=username,AttributeType=S \
    AttributeName=isOnline,AttributeType=N \
  --key-schema AttributeName=userId,KeyType=HASH \
  --global-secondary-indexes \
    "IndexName=email-index,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
    "IndexName=username-index,KeySchema=[{AttributeName=username,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
    "IndexName=isOnline-index,KeySchema=[{AttributeName=isOnline,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
  --billing-mode PROVISIONED \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region ap-southeast-2
```

### 2. Create Conversations Table with Indexes

```bash
aws dynamodb create-table \
  --table-name tixchat-conversations \
  --attribute-definitions \
    AttributeName=conversationId,AttributeType=S \
    AttributeName=participants,AttributeType=S \
    AttributeName=lastMessageAt,AttributeType=N \
    AttributeName=type,AttributeType=S \
  --key-schema AttributeName=conversationId,KeyType=HASH \
  --global-secondary-indexes \
    "IndexName=participants-index,KeySchema=[{AttributeName=participants,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
    "IndexName=lastMessageAt-index,KeySchema=[{AttributeName=lastMessageAt,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
    "IndexName=type-index,KeySchema=[{AttributeName=type,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
  --billing-mode PROVISIONED \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region ap-southeast-2
```

### 3. Create Messages Table with Indexes

```bash
aws dynamodb create-table \
  --table-name tixchat-messages \
  --attribute-definitions \
    AttributeName=messageId,AttributeType=S \
    AttributeName=conversationId,AttributeType=S \
    AttributeName=senderId,AttributeType=S \
    AttributeName=status,AttributeType=S \
    AttributeName=createdAt,AttributeType=N \
  --key-schema AttributeName=messageId,KeyType=HASH \
  --global-secondary-indexes \
    "IndexName=conversationId-createdAt-index,KeySchema=[{AttributeName=conversationId,KeyType=HASH},{AttributeName=createdAt,KeyType=RANGE}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
    "IndexName=senderId-index,KeySchema=[{AttributeName=senderId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
    "IndexName=status-index,KeySchema=[{AttributeName=status,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
  --billing-mode PROVISIONED \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region ap-southeast-2
```

### 4. Create Participants Table with Indexes

```bash
aws dynamodb create-table \
  --table-name tixchat-participants \
  --attribute-definitions \
    AttributeName=participantId,AttributeType=S \
    AttributeName=conversationId,AttributeType=S \
    AttributeName=userId,AttributeType=S \
  --key-schema AttributeName=participantId,KeyType=HASH \
  --global-secondary-indexes \
    "IndexName=conversationId-userId-index,KeySchema=[{AttributeName=conversationId,KeyType=HASH},{AttributeName=userId,KeyType=RANGE}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
  --billing-mode PROVISIONED \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region ap-southeast-2
```

## Setup Using NPM Script

Or use the automated Node.js setup script:

```bash
npm run setup:dynamodb
```

This will create all tables with indexes automatically.

## Verify Tables

Check your tables were created:

```bash
aws dynamodb list-tables --region ap-southeast-2
```

Check a specific table's status:

```bash
aws dynamodb describe-table --table-name tixchat-users --region ap-southeast-2
```

## Important Notes

- ⏱️ **Wait for tables to be ACTIVE** - It may take a few minutes for all tables to become active
- 📊 **Provisioned Throughput** - Current setup uses 5 RCU / 5 WCU per table. Adjust based on your needs
- 💰 **Costs** - Even provisioned capacity incurs costs. Consider on-demand billing for development
- 🔑 **AWS Credentials** - Ensure your AWS credentials are configured in `.env`

