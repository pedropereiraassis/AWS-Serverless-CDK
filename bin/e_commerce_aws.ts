#!/usr/bin/env node
import 'source-map-support/register';
require('dotenv').config();
import { App, Environment } from 'aws-cdk-lib';
import { ProductsAppStack } from '../lib/productsApp-stack';
import { ECommerceApiStack } from '../lib/ecommerceApi-stack';
import { ProductsAppLayersStack } from '../lib/productsAppLayers-Stack';

const app = new App();

const env: Environment = {
  account: process.env.AWS_ACCOUNT!,
  region: process.env.AWS_REGION!
}

const tags = {
  cost: 'ECommerce',
  team: 'DevSquad'
}

const productsAppLayersStack = new ProductsAppLayersStack (app, 'ProductsAppLayers', {
  tags: tags,
  env: env
});

const productsAppStack = new ProductsAppStack(app, 'ProductsApp', {
  tags: tags,
  env: env
});
productsAppStack.addDependency(productsAppLayersStack);

const eCommerceApiStack = new ECommerceApiStack(app, 'ECommerceApi', {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminHandler: productsAppStack.productsAdminHandler,
  tags: tags,
  env: env
});

eCommerceApiStack.addDependency(productsAppStack);