# ASP.NET Core POS - Webhook Integration Setup

## Quick Setup (5 minutes)

### 1. Add the Controller to Your POS

Copy `EcommerceWebhookController.cs` to your ASP.NET Core project:

```
YourPOSProject/
├── Controllers/
│   └── EcommerceWebhookController.cs  ← Add this file
```

### 2. Configure appsettings.json

Add to your `appsettings.json`:

```json
    {
    "EcommerceWebhook": {
        "Url": "https://enisicenter.tech/.netlify/functions/pos-webhook",
        "Secret": "enisicenter-pos-webhook-2026-xK9mN4pQ7sT2"
    }
    }
```

**Important**: The `Secret` must match `POS_WEBHOOK_SECRET` in your `.env` file!

### 3. Register HttpClient in Program.cs or Startup.cs

```csharp
// Program.cs (.NET 6+)
builder.Services.AddHttpClient();

// OR Startup.cs (.NET 5 and earlier)
public void ConfigureServices(IServiceCollection services)
{
    services.AddHttpClient();
    // ... other services
}
```

### 4. Call Webhooks in Your Code

#### When Creating/Updating a Product:

```csharp
public class ProductService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    // After saving product to database:
    public async Task UpdateProduct(Product product)
    {
        // Save to your database first
        await _dbContext.SaveChangesAsync();

        // Then notify e-commerce platform
        await NotifyProductUpdate(product);
    }

    private async Task NotifyProductUpdate(Product product)
    {
        var webhookUrl = _configuration["EcommerceWebhook:Url"];
        var webhookSecret = _configuration["EcommerceWebhook:Secret"];

        var payload = new
        {
            eventType = "product.updated",
            data = new
            {
                pos_sync_id = product.Id.ToString(),
                name = product.Name,
                description = product.Description,
                price = product.Price,
                stock_quantity = product.StockQuantity,
                category = product.Category,
                image_url = product.ImageUrl,
                is_active = product.IsActive
            }
        };

        var client = _httpClientFactory.CreateClient();
        var content = new StringContent(
            JsonSerializer.Serialize(payload),
            Encoding.UTF8,
            "application/json"
        );
        content.Headers.Add("X-POS-Signature", webhookSecret);

        await client.PostAsync(webhookUrl, content);
    }
}
```

#### When Updating Inventory:

```csharp
private async Task NotifyInventoryUpdate(int productId, int newQuantity)
{
    var webhookUrl = _configuration["EcommerceWebhook:Url"];
    var webhookSecret = _configuration["EcommerceWebhook:Secret"];

    var payload = new
    {
        eventType = "inventory.updated",
        data = new
        {
            pos_sync_id = productId.ToString(),
            stock_quantity = newQuantity
        }
    };

    var client = _httpClientFactory.CreateClient();
    var content = new StringContent(
        JsonSerializer.Serialize(payload),
        Encoding.UTF8,
        "application/json"
    );
    content.Headers.Add("X-POS-Signature", webhookSecret);

    await client.PostAsync(webhookUrl, content);
}
```

#### When Deleting a Product:

```csharp
private async Task NotifyProductDelete(int productId)
{
    var webhookUrl = _configuration["EcommerceWebhook:Url"];
    var webhookSecret = _configuration["EcommerceWebhook:Secret"];

    var payload = new
    {
        eventType = "product.deleted",
        data = new
        {
            pos_sync_id = productId.ToString()
        }
    };

    var client = _httpClientFactory.CreateClient();
    var content = new StringContent(
        JsonSerializer.Serialize(payload),
        Encoding.UTF8,
        "application/json"
    );
    content.Headers.Add("X-POS-Signature", webhookSecret);

    await client.PostAsync(webhookUrl, content);
}
```

### 5. Receive Orders from E-commerce

Your POS will automatically receive orders via the `/api/webhooks/receive-order` endpoint.

Implement order processing:

```csharp
public class OrderService
{
    public async Task<Guid> CreateOrderFromEcommerce(OrderWebhookDto orderDto)
    {
        // Create order in your POS database
        var order = new Order
        {
            Id = Guid.NewGuid(),
            OrderNumber = orderDto.OrderNumber,
            CustomerName = orderDto.CustomerName,
            CustomerEmail = orderDto.CustomerEmail,
            CustomerPhone = orderDto.CustomerPhone,
            TotalAmount = orderDto.TotalAmount,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        // Add order items
        foreach (var item in orderDto.Items)
        {
            order.Items.Add(new OrderItem
            {
                ProductId = int.Parse(item.ProductId),
                Quantity = item.Quantity,
                Price = item.Price
            });

            // Update inventory
            await UpdateInventory(int.Parse(item.ProductId), -item.Quantity);
        }

        await _dbContext.Orders.AddAsync(order);
        await _dbContext.SaveChangesAsync();

        return order.Id;
    }
}
```

## Testing

### Local Testing with ngrok

1. Install ngrok: https://ngrok.com/download

2. Run your POS locally:
   ```bash
   dotnet run
   ```

3. Expose via ngrok:
   ```bash
   ngrok http 5000
   ```

4. Update your `.env` with ngrok URL:
   ```
   POS_API_URL=https://abc123.ngrok.io/api
   ```

5. Test the webhook:
   ```bash
   # Update a product in your POS
   # Watch the Netlify function logs to see the webhook received
   ```

## Event Types Supported

| Event | When to Send | Payload |
|-------|-------------|---------|
| `product.created` | New product added | Full product data |
| `product.updated` | Product modified | Full product data |
| `product.deleted` | Product removed | Product ID only |
| `inventory.updated` | Stock changed | Product ID + new quantity |
| `order.created` | (Future) Order created in POS | Full order data |

## Troubleshooting

### Webhook not being received?

1. Check Netlify function logs: `netlify functions:log pos-webhook`
2. Verify webhook URL in `appsettings.json`
3. Check webhook secret matches `.env` file
4. Ensure `X-POS-Signature` header is set

### Orders not creating in POS?

1. Check your POS API logs
2. Verify `/api/webhooks/receive-order` endpoint is accessible
3. Test with Postman/curl

## Production Deployment

1. Deploy your POS to production (Azure, AWS, etc.)
2. Update `appsettings.Production.json`:
   ```json
   {
     "EcommerceWebhook": {
       "Url": "https://enisicenter.tech/.netlify/functions/pos-webhook",
       "Secret": "enisicenter-pos-webhook-2026-xK9mN4pQ7sT2"
     }
   }
   ```
3. Update environment variables in your POS hosting platform

## Security Best Practices

✅ Always verify webhook signatures
✅ Use HTTPS only
✅ Keep webhook secret secure (environment variables)
✅ Log all webhook attempts
✅ Implement rate limiting if needed

## Need Help?

Check the main `POS_INTEGRATION.md` for architecture overview and troubleshooting.
