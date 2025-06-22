import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components"

interface OrderItem {
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  variant?: string
  thumbnail?: string
}

interface OrderConfirmationEmailProps {
  customerName: string
  orderNumber: string
  trackingNumber: string
  orderDate: string
  estimatedDelivery?: string
  items: OrderItem[]
  subtotal: number
  taxAmount: number
  deliveryFee: number
  discount: number
  total: number
  deliveryMethod: "DELIVERY" | "COLLECTION"
  paymentMethod: string
  shippingAddress?: {
    firstName: string
    lastName: string
    streetLine1: string
    streetLine2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  orderTrackingUrl?: string
}

export default function OrderConfirmationEmail({
  customerName = "John Doe",
  orderNumber = "ORD-000001",
  trackingNumber = "WP123456ABC789",
  orderDate = "2024-01-15",
  estimatedDelivery,
  items = [],
  subtotal = 0,
  taxAmount = 0,
  deliveryFee = 0,
  discount = 0,
  total = 0,
  deliveryMethod = "DELIVERY",
  paymentMethod = "CASH_ON_DELIVERY",
  shippingAddress,
  orderTrackingUrl,
}: OrderConfirmationEmailProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount)
  }

  return (
    <Html>
      <Head />
      <Preview>Order Confirmation - {orderNumber} | WalterProjects</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20(54)-NX3G1KANQ2p4Gupgnvn94OQKsGYzyU.png"
              width={180}
              height={60}
              alt="WalterProjects"
              style={logo}
            />
          </Section>

          <Section style={contentContainer}>
            <Heading style={h1}>Order Confirmation</Heading>

            <Text style={paragraph}>Hi {customerName},</Text>

            <Text style={paragraph}>
              Thank you for your order! We're excited to confirm that we've received your order and it's being
              processed. Here are the details of your purchase:
            </Text>

            {/* Order Summary Box */}
            <Section style={orderSummaryContainer}>
              <Row>
                <Column style={orderDetailColumn}>
                  <Text style={orderDetailLabel}>Order Number</Text>
                  <Text style={orderDetailValue}>{orderNumber}</Text>
                </Column>
                <Column style={orderDetailColumn}>
                  <Text style={orderDetailLabel}>Order Date</Text>
                  <Text style={orderDetailValue}>{orderDate}</Text>
                </Column>
              </Row>
              <Row>
                <Column style={orderDetailColumn}>
                  <Text style={orderDetailLabel}>Tracking Number</Text>
                  <Text style={trackingNumberStyle}>{trackingNumber}</Text>
                </Column>
                <Column style={orderDetailColumn}>
                  <Text style={orderDetailLabel}>Delivery Method</Text>
                  <Text style={orderDetailValue}>{deliveryMethod === "DELIVERY" ? "Home Delivery" : "Collection"}</Text>
                </Column>
              </Row>
              {estimatedDelivery && (
                <Row>
                  <Column style={orderDetailColumn}>
                    <Text style={orderDetailLabel}>Estimated Delivery</Text>
                    <Text style={orderDetailValue}>{estimatedDelivery}</Text>
                  </Column>
                  <Column style={orderDetailColumn}>
                    <Text style={orderDetailLabel}>Payment Method</Text>
                    <Text style={orderDetailValue}>{paymentMethod.replace(/_/g, " ")}</Text>
                  </Column>
                </Row>
              )}
            </Section>

            {/* Order Items */}
            <Section style={itemsContainer}>
              <Heading style={sectionHeading}>Order Items</Heading>
              {items.map((item, index) => (
                <Section key={index} style={itemRow}>
                  <Row>
                    <Column style={itemImageColumn}>
                      {item.thumbnail ? (
                        <Img src={item.thumbnail} width={60} height={60} alt={item.name} style={itemImage} />
                      ) : (
                        <div style={itemImagePlaceholder}>📦</div>
                      )}
                    </Column>
                    <Column style={itemDetailsColumn}>
                      <Text style={itemName}>{item.name}</Text>
                      {item.variant && <Text style={itemVariant}>{item.variant}</Text>}
                      <Text style={itemQuantity}>Qty: {item.quantity}</Text>
                    </Column>
                    <Column style={itemPriceColumn}>
                      <Text style={itemPrice}>{formatCurrency(item.totalPrice)}</Text>
                      <Text style={itemUnitPrice}>{formatCurrency(item.unitPrice)} each</Text>
                    </Column>
                  </Row>
                </Section>
              ))}
            </Section>

            {/* Order Total */}
            <Section style={totalContainer}>
              <Row>
                <Column style={totalLabelColumn}>
                  <Text style={totalLabel}>Subtotal:</Text>
                </Column>
                <Column style={totalValueColumn}>
                  <Text style={totalValue}>{formatCurrency(subtotal)}</Text>
                </Column>
              </Row>
              {taxAmount > 0 && (
                <Row>
                  <Column style={totalLabelColumn}>
                    <Text style={totalLabel}>Tax:</Text>
                  </Column>
                  <Column style={totalValueColumn}>
                    <Text style={totalValue}>{formatCurrency(taxAmount)}</Text>
                  </Column>
                </Row>
              )}
              {deliveryFee > 0 && (
                <Row>
                  <Column style={totalLabelColumn}>
                    <Text style={totalLabel}>Delivery Fee:</Text>
                  </Column>
                  <Column style={totalValueColumn}>
                    <Text style={totalValue}>{formatCurrency(deliveryFee)}</Text>
                  </Column>
                </Row>
              )}
              {discount > 0 && (
                <Row>
                  <Column style={totalLabelColumn}>
                    <Text style={totalLabel}>Discount:</Text>
                  </Column>
                  <Column style={totalValueColumn}>
                    <Text style={totalValue}>-{formatCurrency(discount)}</Text>
                  </Column>
                </Row>
              )}
              <Hr style={totalDivider} />
              <Row>
                <Column style={totalLabelColumn}>
                  <Text style={grandTotalLabel}>Total:</Text>
                </Column>
                <Column style={totalValueColumn}>
                  <Text style={grandTotalValue}>{formatCurrency(total)}</Text>
                </Column>
              </Row>
            </Section>

            {/* Shipping Address */}
            {shippingAddress && deliveryMethod === "DELIVERY" && (
              <Section style={addressContainer}>
                <Heading style={sectionHeading}>Delivery Address</Heading>
                <Text style={addressText}>
                  {shippingAddress.firstName} {shippingAddress.lastName}
                  <br />
                  {shippingAddress.streetLine1}
                  <br />
                  {shippingAddress.streetLine2 && (
                    <>
                      {shippingAddress.streetLine2}
                      <br />
                    </>
                  )}
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                  <br />
                  {shippingAddress.country}
                </Text>
              </Section>
            )}

            {/* Track Order Button */}
            {orderTrackingUrl && (
              <Section style={buttonContainer}>
                <Button style={trackButton} href={orderTrackingUrl}>
                  Track Your Order
                </Button>
              </Section>
            )}

            <Hr style={divider} />

            <Text style={securityNote}>
              <strong>What's next?</strong> We'll send you another email when your order ships. You can track your order
              status anytime using your tracking number: <strong>{trackingNumber}</strong>
            </Text>

            <Text style={paragraph}>
              If you have any questions about your order, please don't hesitate to contact us.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>© {new Date().getFullYear()} WalterProjects. All rights reserved.</Text>
            <Text style={footerLinks}>
              <Link href="https://walterprojects.com/privacy" style={footerLink}>
                Privacy Policy
              </Link>{" "}
              •
              <Link href="https://walterprojects.com/terms" style={footerLink}>
                {" "}
                Terms of Service
              </Link>{" "}
              •
              <Link href="https://walterprojects.com/contact" style={footerLink}>
                {" "}
                Contact Us
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: "#f5f5f5",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  padding: "20px 0",
}

const container = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
}

const logoContainer = {
  backgroundColor: "#0ea5e9", // sky-500
  padding: "24px 0",
  textAlign: "center" as const,
}

const logo = {
  margin: "0 auto",
}

const contentContainer = {
  padding: "32px 40px",
}

const h1 = {
  color: "#111111",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "32px",
  margin: "0 0 24px 0",
  textAlign: "center" as const,
}

const paragraph = {
  color: "#444444",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px 0",
}

const orderSummaryContainer = {
  background: "#f8fafc",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  border: "1px solid #e2e8f0",
}

const orderDetailColumn = {
  width: "50%",
  paddingBottom: "12px",
}

const orderDetailLabel = {
  color: "#64748b",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0 0 4px 0",
}

const orderDetailValue = {
  color: "#1e293b",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0",
}

const trackingNumberStyle = {
  color: "#0ea5e9", // sky-500
  fontSize: "16px",
  fontWeight: "700",
  margin: "0",
  letterSpacing: "1px",
}

const sectionHeading = {
  color: "#1e293b",
  fontSize: "18px",
  fontWeight: "600",
  margin: "32px 0 16px 0",
}

const itemsContainer = {
  margin: "32px 0",
}

const itemRow = {
  borderBottom: "1px solid #e2e8f0",
  paddingBottom: "16px",
  marginBottom: "16px",
}

const itemImageColumn = {
  width: "80px",
  verticalAlign: "top" as const,
}

const itemImage = {
  borderRadius: "4px",
  objectFit: "cover" as const,
}

const itemImagePlaceholder = {
  width: "60px",
  height: "60px",
  backgroundColor: "#f1f5f9",
  borderRadius: "4px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px",
}

const itemDetailsColumn = {
  verticalAlign: "top" as const,
  paddingLeft: "16px",
}

const itemName = {
  color: "#1e293b",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 4px 0",
}

const itemVariant = {
  color: "#64748b",
  fontSize: "14px",
  margin: "0 0 4px 0",
}

const itemQuantity = {
  color: "#64748b",
  fontSize: "14px",
  margin: "0",
}

const itemPriceColumn = {
  width: "120px",
  textAlign: "right" as const,
  verticalAlign: "top" as const,
}

const itemPrice = {
  color: "#1e293b",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 4px 0",
}

const itemUnitPrice = {
  color: "#64748b",
  fontSize: "14px",
  margin: "0",
}

const totalContainer = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "24px",
  margin: "32px 0",
}

const totalLabelColumn = {
  width: "70%",
}

const totalValueColumn = {
  width: "30%",
  textAlign: "right" as const,
}

const totalLabel = {
  color: "#64748b",
  fontSize: "14px",
  margin: "0 0 8px 0",
}

const totalValue = {
  color: "#1e293b",
  fontSize: "14px",
  margin: "0 0 8px 0",
}

const totalDivider = {
  border: "none",
  borderTop: "1px solid #cbd5e1",
  margin: "16px 0",
}

const grandTotalLabel = {
  color: "#1e293b",
  fontSize: "18px",
  fontWeight: "700",
  margin: "0",
}

const grandTotalValue = {
  color: "#0ea5e9", // sky-500
  fontSize: "18px",
  fontWeight: "700",
  margin: "0",
}

const addressContainer = {
  margin: "32px 0",
}

const addressText = {
  color: "#444444",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
}

const trackButton = {
  backgroundColor: "#0ea5e9", // sky-500
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
}

const divider = {
  border: "none",
  borderTop: "1px solid #eaeaea",
  margin: "32px 0",
}

const securityNote = {
  backgroundColor: "#f0f9ff",
  border: "1px solid #e0f2fe",
  borderLeft: "4px solid #0ea5e9", // sky-500
  borderRadius: "4px",
  color: "#444444",
  fontSize: "14px",
  lineHeight: "20px",
  padding: "16px",
  margin: "24px 0 0 0",
}

const footer = {
  backgroundColor: "#f9f9f9",
  padding: "24px 40px",
  textAlign: "center" as const,
}

const footerText = {
  color: "#666666",
  fontSize: "14px",
  margin: "0 0 16px 0",
}

const footerLinks = {
  color: "#666666",
  fontSize: "14px",
  margin: "0",
}

const footerLink = {
  color: "#0ea5e9", // sky-500
  textDecoration: "none",
}
