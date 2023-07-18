import infobip from 'infobip';

const BASE_URL = 'https://dmv2gr.api.infobip.com';
const API_KEY = '4d2efb170ef607cce09c70a1db6cbf59-368a6a09-affe-4657-84f9-0fba1fda88af';
const RECIPIENT = '528128865799';

export const sendSms = async function sendSms() {
  // Create the API client and the Send SMS API instances.
  const apiClient = new infobip.ApiClient(API_KEY, BASE_URL);
  const sendSmsApi = new infobip.SmsApi(apiClient);

  // Create a message to send.
  const smsMessage = {
    destinations: [{ to: RECIPIENT }],
    text: 'Tonces perro',
  };

  // Create a send message request.
  const smsMessageRequest = {
    messages: [smsMessage],
  };

  try {
    // Send the message.
    const smsResponse = await sendSmsApi.sendSmsMessage(smsMessageRequest);

    console.log('Response body:', smsResponse.body);

    // Get delivery reports. It may take a few seconds to show the above-sent message.
    const reportsResponse = await sendSmsApi.getOutboundSmsMessageDeliveryReports();

    console.log(reportsResponse.body.results);
  } catch (e) {
    console.log('HTTP status code:', e.responseStatusCode);
    console.log('Response body:', e.rawResponseBody);
  }
}

