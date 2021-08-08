import * as cdk from '@aws-cdk/core';
import * as iotanalytics from '@aws-cdk/aws-iotanalytics';

export class IotAnalyticsSampleStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a channel with S3 bucket managed by AWS IoT Analytics. 
    const channel = new iotanalytics.CfnChannel(this, 'sample-iotanalytics-channel-id', {
      channelName: 'samplechannel',
    });

    // A data store receives and stores messages. the data store file format is JSON by default.
    // Processed data store messages are stored in an Amazon S3 bucket managed by AWS IoT Analytics.
    const store = new iotanalytics.CfnDatastore(this, 'sample-iotanalytics-store-id', {
      datastoreName: 'sampledatastore',
      // When you use data partitioning to organize data, you can query on pruned data. This decreases the amount of data scanned per query and improves latency.
      datastorePartitions: {
        partitions: [{
          timestampPartition: {attributeName: '__partition_', timestampFormat: 'yyyy-MM-dd HH:mm:ss'}
        }]
      }
    });

    new iotanalytics.CfnPipeline(this, 'sample-iotanalytics-pipeline-id', {
      pipelineName: 'samplepipeline',
      pipelineActivities: [
        { channel: { name: 'channelactivity', channelName: channel.channelName, next: 'storeactivity' } },
        { datastore: { name: 'storeactivity', datastoreName: store.datastoreName } }
      ]
    });
  }
}
