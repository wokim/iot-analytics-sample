import * as cdk from '@aws-cdk/core';
import * as iotanalytics from '@aws-cdk/aws-iotanalytics';
import * as iot from '@aws-cdk/aws-iot';
import { Role, ServicePrincipal, PolicyStatement, Effect } from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import { CfnDataset } from '@aws-cdk/aws-iotanalytics';

export class IotAnalyticsSampleStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a channel message store.
    const channelMessageStoreBucket = new s3.Bucket(this, 'SampleChannelMessageStoreBucketId', {
      bucketName: 'sample-channel-message-store-bucket'
    });

    const channelRole = (new Role(this, 'SampleChannelRole', {
      roleName: 'SampleIoTAnalyticsChannelRole',
      assumedBy: new ServicePrincipal('iotanalytics.amazonaws.com'),
    }));
    channelRole.addToPolicy(new PolicyStatement({
      sid: 'SampleChannelMessageStoreStatementId',
      effect: Effect.ALLOW,
      actions: ['s3:GetObject', 's3:GetBucketLocation', 's3:ListBucket', 's3:PutObject'],
      resources: [channelMessageStoreBucket.bucketArn, `${channelMessageStoreBucket.bucketArn}/*`],
    }));

    // // Create a channel with S3 bucket managed by AWS IoT Analytics. 
    const channel = new iotanalytics.CfnChannel(this, 'SampleChannelId', {
      // The channel name must contain 1-128 characters. Valid characters are a-z, A-Z, 0-9, and _ (underscore).
      channelName: 'sample_channel',
      channelStorage: {
        customerManagedS3: {
          bucket: channelMessageStoreBucket.bucketName,
          roleArn: channelRole.roleArn,
        }
      }
    });

    // Create a processed data store.
    const dataStoreBucket = new s3.Bucket(this, 'SampleDataStoreBucketId', {
      bucketName: 'sample-data-store-bucket'
    });

    const dataStoreRole = (new Role(this, 'SampleDataStoreRole', {
      roleName: 'SampleIoTAnalyticsDataStoreRole',
      assumedBy: new ServicePrincipal('iotanalytics.amazonaws.com'),
    }));
    dataStoreRole.addToPolicy(new PolicyStatement({
      sid: 'SampleDataStoreStatementId',
      effect: Effect.ALLOW,
      actions: [
        's3:GetObject',
        's3:GetBucketLocation',
        's3:ListBucket',
        's3:ListBucketMultipartUploads',
        's3:ListMultipartUploadParts',
        's3:AbortMultipartUpload',
        's3:PutObject',
        's3:DeleteObject'
      ],
      resources: [dataStoreBucket.bucketArn, `${dataStoreBucket.bucketArn}/*`],
    }));

    // A data store receives and stores messages. the data store file format is JSON by default.
    // Processed data store messages are stored in an Amazon S3 bucket managed by AWS IoT Analytics.
    const store = new iotanalytics.CfnDatastore(this, 'SampleStoreId', {
      datastoreName: 'sample_datastore',
      // When you use data partitioning to organize data, you can query on pruned data. This decreases the amount of data scanned per query and improves latency.
      // datastorePartitions: {
      //   partitions: [{
      //     timestampPartition: {attributeName: '__partition_', timestampFormat: 'yyyy-MM-dd HH:mm:ss'}
      //   }]
      // },
      datastoreStorage: {
        customerManagedS3: {
          bucket: dataStoreBucket.bucketName,
          roleArn: dataStoreRole.roleArn
        }
      }
    });

    // Create a pipeline to connect a channel to a data store.
    new iotanalytics.CfnPipeline(this, 'SamplePipelineId', {
      pipelineName: 'sample_pipeline',
      pipelineActivities: [
        { channel: { name: 'channelactivity', channelName: channel.channelName, next: 'storeactivity' } },
        { datastore: { name: 'storeactivity', datastoreName: store.datastoreName } }
      ]
    });

    // To have AWS IoT messages routed into an AWS IoT Analytics channel, you set up a rule.
    const topicRuleRole = new Role(this, 'SampleIoTAnalyticsRoleId', {
      roleName: 'SampleIoTTopicRuleRole',
      assumedBy: new ServicePrincipal('iot.amazonaws.com'),
    });
    topicRuleRole.addToPolicy(new PolicyStatement({
      sid: 'SampleIoTTopicRuleStatementId',
      effect: Effect.ALLOW,
      actions: ['iotanalytics:BatchPutMessage'],
      resources: [`arn:aws:iotanalytics:${process.env.CDK_DEFAULT_REGION}:${process.env.CDK_DEFAULT_ACCOUNT}:channel/${channel.channelName}`],
    }));

    // Create an AWS IoT rule that sends messages to the channel.
    new iot.CfnTopicRule(this, 'SampleTopicRuleId', {
      ruleName: 'sample_topic_rule',
      topicRulePayload: {
        sql: 'SELECT * FROM \'iot/test\'',
        ruleDisabled: false,
        awsIotSqlVersion: '2016-03-23',
        actions: [{
          iotAnalytics: {
            channelName: channel.channelName!,
            roleArn: topicRuleRole.roleArn
          }
        }]
      }
    });

    new iotanalytics.CfnDataset(this, 'SampleDatasetId', {
      datasetName: 'sample_dataset',
      actions: [{
        actionName: 'select_action',
        queryAction: {
          sqlQuery: `select * from ${store.datastoreName}`
        }
      }]
    });
  }
}
