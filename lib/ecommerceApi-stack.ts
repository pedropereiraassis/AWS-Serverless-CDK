import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Stack, StackProps } from 'aws-cdk-lib';
import { AccessLogFormat, LambdaIntegration, 
  LogGroupLogDestination, RequestValidator, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { LogGroup } from 'aws-cdk-lib/aws-logs';

interface ECommerceApiStackProps extends StackProps {
  productsFetchHandler: NodejsFunction
  productsAdminHandler: NodejsFunction
  ordersHandler: NodejsFunction
}

export class ECommerceApiStack extends Stack {

  constructor(scope: Construct, id: string, props: ECommerceApiStackProps) {
    super(scope, id, props);

    const logGroup = new LogGroup(this, 'ECommerceApiLogs');

    const api = new RestApi(this, 'ECommerceApi', {
      restApiName: 'ECommerceApi',
      deployOptions: {
        accessLogDestination: new LogGroupLogDestination(logGroup),
        accessLogFormat: AccessLogFormat.jsonWithStandardFields({
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          caller: true,
          user: true
        })
      }
    });

    this.createProductsService(props, api);
    this.createOrdersService(props, api);
  }

  private createOrdersService(props: ECommerceApiStackProps, api: RestApi) {
    const ordersIntegration = new LambdaIntegration(props.ordersHandler);

    //resource - /orders
    const ordersResource = api.root.addResource('orders');

    //GET /orders
    //GET /orders?email=paul@email.com
    //GET /orders?email=paul@email.com&orderId=123
    ordersResource.addMethod('GET', ordersIntegration);

    const orderDeletionValidator = new RequestValidator(this, 'OrderDeletionValidator',
    {
      restApi: api,
      requestValidatorName: 'OrderDeletionValidator',
      validateRequestParameters: true
    });

    //DELETE /orders?email=paul@email.com&orderId=123
    ordersResource.addMethod('DELETE', ordersIntegration,
    {
      requestParameters: {
        'method.request.querystring.email': true,
        'method.request.querystring.orderId': true
      },
      requestValidator: orderDeletionValidator
    });

    //POST /orders
    ordersResource.addMethod('POST', ordersIntegration);
  }

  private createProductsService(props: ECommerceApiStackProps, api: RestApi) {
    const productsFetchIntegration = new LambdaIntegration(props.productsFetchHandler);

    // GET /products
    const productsResource = api.root.addResource('products');
    productsResource.addMethod('GET', productsFetchIntegration);

    // GET /products/{id}
    const productIdResource = productsResource.addResource('{id}');
    productIdResource.addMethod('GET', productsFetchIntegration);

    const productsAdminIntegration = new LambdaIntegration(props.productsAdminHandler);

    // POST /products
    productsResource.addMethod('POST', productsAdminIntegration);

    // PUT /products/{id}
    productIdResource.addMethod('PUT', productsAdminIntegration);

    // DELETE /products/{id}
    productIdResource.addMethod('DELETE', productsAdminIntegration);
  }
}