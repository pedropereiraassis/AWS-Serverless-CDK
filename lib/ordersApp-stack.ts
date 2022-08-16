import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { LambdaInsightsVersion, LayerVersion, Tracing } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from 'constructs';

interface OrdersAppStackProps extends StackProps {
  productsDdb: Table
}

export class OrdersAppStack extends Stack {
  readonly ordersHandler: NodejsFunction;

  constructor(scope: Construct, id: string, props: OrdersAppStackProps) {
    super(scope, id, props);

    const ordersDdb = new Table(this, 'OrdersDdb',
    {
      tableName: 'orders',
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'sk',
        type: AttributeType.STRING
      },
      billingMode: BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1
    });

    // Orders Layer
    const ordersLayerArn = StringParameter
      .valueForStringParameter(this, 'OrdersLayerVersionArn');
    const ordersLayer = LayerVersion
      .fromLayerVersionArn(this, 'OrdersLayerVersionArn', ordersLayerArn);
    
      // Products Layer
    const productsLayerArn = StringParameter
      .valueForStringParameter(this, 'ProductsLayerVersionArn');
    const productsLayer = LayerVersion
      .fromLayerVersionArn(this, 'ProductsLayerVersionArn', productsLayerArn);
    
    this.ordersHandler = new NodejsFunction(this, 'OrdersFunction',
    {
      functionName: 'OrdersFunction',
      entry: 'lambda/orders/ordersFunction.ts',
      handler: 'handler',
      memorySize: 128,
      timeout: Duration.seconds(2),
      bundling: {
        minify: true,
        sourceMap: false
      },
      environment: {
        PRODUCTS_DDB: props.productsDdb.tableName,
        ORDERS_DDB: ordersDdb.tableName
      },
      layers: [ordersLayer, productsLayer],
      tracing: Tracing.ACTIVE,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_119_0
    });

    ordersDdb.grantReadWriteData(this.ordersHandler);
    props.productsDdb.grantReadData(this.ordersHandler);
  }
}