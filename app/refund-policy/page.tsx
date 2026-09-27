import { PolicyPage } from '@/components/policy-page';

export default function Refund(){
  return <PolicyPage eyebrow="REFUNDS" title="Refunds, clearly handled." intro="Refunds are linked to an approved return or eligible cancellation and are recorded by the owner so every outcome has a clear trail.">
    <h2>When a refund can happen</h2>
    <p>A refund may be issued for an eligible returned item, a verified damaged/incorrect item, or an eligible cancellation before dispatch. Return eligibility is reviewed against the order, delivery date and item condition.</p>

    <h2>Return inspection</h2>
    <p>For returns, the item is checked after it is received. Normal returns require the T-shirt to be unworn, unwashed and unaltered, with original tags and packaging. Verified manufacturing defects and incorrect shipments are handled separately.</p>

    <h2>How the refund is recorded</h2>
    <p>The owner records the approved refund amount, refund method and refund reference in the private admin dashboard. This gives the store a clear record of what was refunded and when.</p>

    <h2>Refund method & timing</h2>
    <p>Refunds are sent to the original payment method where practical, or to UPI details confirmed by support. Once LOLA marks a refund as completed, the time for the amount to appear can vary by the bank or payment system.</p>

    <h2>What may be excluded</h2>
    <p>Shipping, platform charges or other non-refundable components may be treated according to the applicable order policy and the reason for the return. The final refund amount is confirmed when the return is approved.</p>

    <h2>Need help?</h2>
    <p>Use the <a href="/returns">Returns & Refunds</a> page to submit or check a request. Keep your order number and checkout phone number available.</p>

    <p className="return-fine">This is a store policy summary. Applicable consumer-protection rights remain unaffected. The owner should have the final policy reviewed for the business’s actual operating model before launch.</p>
  </PolicyPage>;
}