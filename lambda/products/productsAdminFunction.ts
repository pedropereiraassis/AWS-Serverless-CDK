import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export async function handler(event: APIGatewayProxyEvent,
  context: Context): Promise<APIGatewayProxyResult> {

  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;

  console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`)
  
  if (event.resource === '/products') {
    console.log('POST /products');

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'POST /products - OK'
      })
    }
  } else if (event.resource === '/products/{id}') {
    const productId = event.pathParameters!.id as string;

    if (event.httpMethod === 'PUT') {
      console.log(`PUT /products/${productId}`);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `PUT /products/${productId} - OK`
        })
      }
    } else if (event.httpMethod === 'DELETE') {
      console.log(`DELETE /products/${productId}`);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `DELETE /products/${productId} - OK`
        })
      }
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: 'Bad Request'
    })
  }
}