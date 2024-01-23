const { PubSub } = require('@google-cloud/pubsub');

process.env.PUBSUB_EMULATOR_HOST = 'localhost:8085';

async function publishMessage() {
  console.log("siema")
  const pubSubClient = new PubSub({
    projectId: 'dex-scanner',
  });

  const topicName = 'minute-tick';
  const data = JSON.stringify({ message: 'Your message here' });
  const dataBuffer = Buffer.from(data);

  try {
    const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
    console.log(`Message ${messageId} published.`);
  } catch (error) {
    console.error(`Error publishing message: ${error.message}`);
  }
}

publishMessage();