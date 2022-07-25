#!/usr/bin/env node
import 'source-map-support/register';
require('dotenv').config();
import { App, Environment } from 'aws-cdk-lib';
import { ProductsAppStack } from '../lib/productsApp-stack';
import { ECommerceApiStack } from '../lib/ecommerceApi-stack';

const app = new App();

const env: Environment = {
  account: process.env.AWS_ACCOUNT,
  region: process.env.AWS_REGION
}

const tags = {
  cost: 'ECommerce',
  team: 'DevSquad'
}

const productsAppStack = new ProductsAppStack(app, 'ProductsApp', {
  tags: tags,
  env: env
});

const eCommerceApiStack = new ECommerceApiStack(app, 'ECommerceApi', {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminHandler: productsAppStack.productsAdminHandler,
  tags: tags,
  env: env
});

eCommerceApiStack.addDependency(productsAppStack);