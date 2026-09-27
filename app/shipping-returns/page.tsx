import { PolicyPage } from '@/components/policy-page';

export default function Shipping(){
  return <PolicyPage eyebrow="DELIVERY · RETURNS" title="Delivery, returns & exchanges." intro="Everything you need to know before and after your LOLA order — from shipping charges to return requests and refunds.">
    <h2>Shipping</h2>
    <p>Orders are shipped to the delivery address provided at checkout. The shipping charge shown at checkout is the final shipping charge for that order. Orders at or above the configured free-shipping threshold receive free shipping when the offer is active.</p>

    <h2>7-day return window</h2>
    <p>Eligible T-shirts may be returned within 7 days of delivery. Please submit the return request through our <a href="/returns">Returns & Refunds</a> page using the order number and the phone number used at checkout.</p>

    <h2>Condition required</h2>
    <p>For a normal size/fit or change-of-mind return, the T-shirt must be unworn, unwashed and unaltered, with its original tags and packaging intact. We may decline a return if the item shows signs of use, washing, alteration or damage after delivery.</p>

    <h2>Damaged or wrong item</h2>
    <p>If you receive a damaged, defective or incorrect T-shirt, contact us within 48 hours of delivery. Please keep the item, tags and packaging and provide clear photos or video when requested so the issue can be reviewed quickly.</p>

    <h2>Return shipping</h2>
    <p>For an eligible change-of-mind or size/fit return, return-shipping arrangements may be the customer’s responsibility. For a verified wrong or defective item, LOLA will coordinate the appropriate return solution. The owner will confirm the applicable arrangement when approving the request.</p>

    <h2>Refunds</h2>
    <p>After an approved return is received and passes inspection, the owner records the refund in the secure admin dashboard. Refunds are sent to the original payment method where practical, or to UPI details confirmed by support. The exact credited date can depend on the banking/payment system.</p>

    <h2>Order cancellations</h2>
    <p>If an order has not yet been processed for dispatch, contact support as soon as possible. Once an order has entered dispatch, it may need to follow the return process instead.</p>

    <h2>Support</h2>
    <p>Keep your order number and checkout phone number ready when contacting LOLA. The owner can review payment, order, return and refund status from the private dashboard.</p>

    <p className="return-fine">This policy is a store-level summary and does not remove any consumer rights that apply under Indian law. LOLA should review this policy with its legal/tax adviser before launch and update it if its operational policy changes.</p>
  </PolicyPage>;
}