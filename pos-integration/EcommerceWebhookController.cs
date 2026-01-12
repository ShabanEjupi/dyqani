using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace KosovaPOS.Controllers
{
    /// <summary>
    /// Webhook integration controller for syncing with Netlify/Supabase e-commerce platform
    /// </summary>
    [ApiController]
    [Route("api/webhooks")]
    public class EcommerceWebhookController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<EcommerceWebhookController> _logger;

        public EcommerceWebhookController(
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<EcommerceWebhookController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _logger = logger;
        }

        /// <summary>
        /// Send product update notification to e-commerce platform
        /// Call this after creating or updating a product
        /// </summary>
        [HttpPost("notify-product-update")]
        public async Task<IActionResult> NotifyProductUpdate([FromBody] ProductWebhookDto product)
        {
            try
            {
                var webhookUrl = _configuration["EcommerceWebhook:Url"];
                var webhookSecret = _configuration["EcommerceWebhook:Secret"];

                if (string.IsNullOrEmpty(webhookUrl))
                {
                    _logger.LogWarning("Ecommerce webhook URL not configured");
                    return BadRequest("Webhook URL not configured");
                }

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

                var result = await SendWebhook(webhookUrl, webhookSecret, payload);
                
                return result 
                    ? Ok(new { message = "Product update webhook sent successfully" })
                    : StatusCode(500, new { message = "Failed to send webhook" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending product update webhook");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Send product deletion notification
        /// </summary>
        [HttpPost("notify-product-delete")]
        public async Task<IActionResult> NotifyProductDelete([FromBody] ProductDeleteDto product)
        {
            try
            {
                var webhookUrl = _configuration["EcommerceWebhook:Url"];
                var webhookSecret = _configuration["EcommerceWebhook:Secret"];

                var payload = new
                {
                    eventType = "product.deleted",
                    data = new
                    {
                        pos_sync_id = product.Id.ToString()
                    }
                };

                var result = await SendWebhook(webhookUrl, webhookSecret, payload);
                
                return result 
                    ? Ok(new { message = "Product delete webhook sent successfully" })
                    : StatusCode(500, new { message = "Failed to send webhook" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending product delete webhook");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Send inventory update notification
        /// Call this when stock quantity changes
        /// </summary>
        [HttpPost("notify-inventory-update")]
        public async Task<IActionResult> NotifyInventoryUpdate([FromBody] InventoryUpdateDto inventory)
        {
            try
            {
                var webhookUrl = _configuration["EcommerceWebhook:Url"];
                var webhookSecret = _configuration["EcommerceWebhook:Secret"];

                var payload = new
                {
                    eventType = "inventory.updated",
                    data = new
                    {
                        pos_sync_id = inventory.ProductId.ToString(),
                        stock_quantity = inventory.StockQuantity
                    }
                };

                var result = await SendWebhook(webhookUrl, webhookSecret, payload);
                
                return result 
                    ? Ok(new { message = "Inventory update webhook sent successfully" })
                    : StatusCode(500, new { message = "Failed to send webhook" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending inventory update webhook");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Receive order from e-commerce platform
        /// This endpoint is called by Netlify functions when an order is placed
        /// </summary>
        [HttpPost("receive-order")]
        public async Task<IActionResult> ReceiveOrder([FromBody] OrderWebhookDto order)
        {
            try
            {
                // Verify webhook signature
                var expectedSecret = _configuration["EcommerceWebhook:Secret"];
                var receivedSignature = Request.Headers["X-Ecommerce-Signature"].FirstOrDefault();

                if (receivedSignature != expectedSecret)
                {
                    _logger.LogWarning("Invalid webhook signature received");
                    return Unauthorized(new { message = "Invalid signature" });
                }

                // TODO: Process the order in your POS system
                // Example:
                // await _orderService.CreateOrder(order);

                _logger.LogInformation("Received order from e-commerce: {OrderNumber}", order.OrderNumber);

                return Ok(new { 
                    message = "Order received successfully",
                    id = Guid.NewGuid(), // Return your POS order ID
                    orderId = order.OrderNumber
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing order webhook");
                return StatusCode(500, new { message = "Failed to process order", error = ex.Message });
            }
        }

        /// <summary>
        /// Send webhook to e-commerce platform
        /// </summary>
        private async Task<bool> SendWebhook(string url, string secret, object payload)
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                var content = new StringContent(
                    JsonSerializer.Serialize(payload),
                    Encoding.UTF8,
                    "application/json"
                );

                // Add authentication header
                if (!string.IsNullOrEmpty(secret))
                {
                    content.Headers.Add("X-POS-Signature", secret);
                }

                var response = await client.PostAsync(url, content);
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Webhook sent successfully to {Url}", url);
                    return true;
                }
                else
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Webhook failed with status {Status}: {Error}", 
                        response.StatusCode, errorBody);
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception sending webhook to {Url}", url);
                return false;
            }
        }
    }

    // DTOs for webhook payloads
    public class ProductWebhookDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string Category { get; set; }
        public string ImageUrl { get; set; }
        public bool IsActive { get; set; }
    }

    public class ProductDeleteDto
    {
        public int Id { get; set; }
    }

    public class InventoryUpdateDto
    {
        public int ProductId { get; set; }
        public int StockQuantity { get; set; }
    }

    public class OrderWebhookDto
    {
        public string OrderNumber { get; set; }
        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
        public string CustomerPhone { get; set; }
        public CustomerAddressDto CustomerAddress { get; set; }
        public List<OrderItemDto> Items { get; set; }
        public decimal Subtotal { get; set; }
        public decimal ShippingCost { get; set; }
        public decimal Discount { get; set; }
        public decimal TotalAmount { get; set; }
        public string PaymentMethod { get; set; }
        public string DeliveryMethod { get; set; }
        public string Notes { get; set; }
    }

    public class CustomerAddressDto
    {
        public string Street { get; set; }
        public string City { get; set; }
        public string PostalCode { get; set; }
        public string Country { get; set; }
    }

    public class OrderItemDto
    {
        public string ProductId { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string Image { get; set; }
    }
}
