#!/usr/bin/env node
import 'source-map-support/register';
require('dotenv').config();
import { App, Environment } from 'aws-cdk-lib';
import { ProductsAppStack } from '../lib/productsApp-stack';
import { ECommerceApiStack } from '../lib/ecommerceApi-stack';
import { ProductsAppLayersStack } from '../lib/productsAppLayers-Stack';
import { EventsDdbStack } from '../lib/eventsDdb-stack';
import { OrdersAppLayersStack } from '../lib/ordersAppLayers-stack';
import { OrdersAppStack } from '../lib/ordersApp-stack';

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

const eventsDdbStack = new EventsDdbStack(app, 'EventsDdb', {
  tags: tags,
  env: env
});

const productsAppStack = new ProductsAppStack(app, 'ProductsApp', {
  eventsDdb: eventsDdbStack.table,
  tags: tags,
  env: env
});
productsAppStack.addDependency(productsAppLayersStack);
productsAppStack.addDependency(eventsDdbStack);

const ordersAppLayersStack = new OrdersAppLayersStack(app, 'OrdersAppLayers', 
{
  tags: tags,
  env: env
});

const ordersAppStack = new OrdersAppStack(app, 'OrdersApp',
{
  tags: tags,
  env: env,
  productsDdb: productsAppStack.productsDdb
});
ordersAppStack.addDependency(productsAppStack);
ordersAppStack.addDependency(ordersAppLayersStack);

const eCommerceApiStack = new ECommerceApiStack(app, 'ECommerceApi', {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminHandler: productsAppStack.productsAdminHandler,
  ordersHandler: ordersAppStack.ordersHandler,
  tags: tags,
  env: env
});

eCommerceApiStack.addDependency(productsAppStack);
eCommerceApiStack.addDependency(ordersAppStack);