#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MarqueeCommentsViewerStack } from '../lib/MarqueeCommentsViewerStack';

const app = new cdk.App();
new MarqueeCommentsViewerStack(app, 'MarqueeCommentsViewerStack', {});