using Amazon;
using Amazon.CloudFormation;
using Amazon.CloudFormation.Model;
using Amazon.Runtime;
using Amazon.Runtime.CredentialManagement;
using Amazon.SQS;
using Amazon.SQS.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Media.Effects;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using System.Windows.Threading;

namespace MarqueeCommentsViewer
{
    public partial class MainWindow : Window
    {
        private Random random = new Random();
        private double windowWidth = 300;
        private double windowHeight = 300;
        private const string STACK_NAME = "MarqueeCommentsViewerStack";

        public MainWindow()
        {
            InitializeComponent();
            SizeChanged += OnWindowSizeChanged;
            ContentRendered += OnContentRendered;

            AWSCredentials credentials;
            if (GetCredential("default", out credentials) == false)
            {
                Console.WriteLine("failed to execute");
                Environment.Exit(0);
            }

            var queueUrl = "";
            using (var cfnClient = new AmazonCloudFormationClient(credentials, RegionEndpoint.APNortheast1))
            {
                var request = new ListStackResourcesRequest();
                request.StackName = STACK_NAME;
                var response = cfnClient.ListStackResources(request);
                foreach(var resource in response.StackResourceSummaries)
                {
                    if (resource.ResourceType == "AWS::SQS::Queue")
                    {
                        queueUrl = resource.PhysicalResourceId;
                    }
                }
            }

            var sqsClient = new AmazonSQSClient(credentials, RegionEndpoint.APNortheast1);
            StartFetchQueue(sqsClient, queueUrl);
        }

        private async void StartFetchQueue(AmazonSQSClient client, String queueUrl)
        {
            while (true)
            {
                Console.WriteLine("Waiting for comments...");
                await ReceiveQueue(client, queueUrl);
            }
        }

        private async Task ReceiveQueue(AmazonSQSClient client, String queueUrl)
        {
            var receiveMessageRequest = new ReceiveMessageRequest
            {
                MaxNumberOfMessages = 1,
                QueueUrl = queueUrl,
                WaitTimeSeconds = 20,
            };

            var receiveMessageResponse = await client.ReceiveMessageAsync(receiveMessageRequest);

            if (receiveMessageResponse.Messages.Count > 0)
            {
                var message = receiveMessageResponse.Messages[0];
                Console.WriteLine($"[Message] {message.Body}");

                var deleteMessageRequest = new DeleteMessageRequest
                {
                    QueueUrl = queueUrl,
                    ReceiptHandle = message.ReceiptHandle
                };
                await client.DeleteMessageAsync(deleteMessageRequest);

                var x = windowWidth;
                var y = random.NextDouble() * (windowHeight - 100) + 50;
                var comment = new Comment(message.Body, x, y);
                comment.Associate(CommentCanvas);
                comment.Animate();
            }
        }

        private static bool GetCredential(string profileName, out AWSCredentials credential)
        {
            var homeDrive = Environment.GetEnvironmentVariable("HomeDrive");
            var homePath = Environment.GetEnvironmentVariable("HomePath");
            var homeDirectory = homeDrive + homePath;
            var filePath = System.IO.Path.Combine(homeDirectory, ".aws", "credentials");

            var chain = new CredentialProfileStoreChain(filePath);
            AWSCredentials awsCredentials;
            if (chain.TryGetAWSCredentials(profileName, out awsCredentials) == false)
            {
                credential = null;
                return false;
            }

            credential = awsCredentials;
            return true;
        }
        private void OnWindowSizeChanged(object sender, SizeChangedEventArgs e)
        {
            windowWidth = e.NewSize.Width;
            windowHeight = e.NewSize.Height;
        }

        private void OnContentRendered(object sender, EventArgs e)
        {
            windowWidth = ActualWidth;
            windowHeight = ActualHeight;
        }
    }
}
