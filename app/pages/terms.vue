<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-12">
    <h1 class="mb-8 text-3xl font-bold tracking-tight">Terms of Use & Privacy</h1>

    <div class="prose prose-sm max-w-none space-y-8 text-muted-foreground">
      <section>
        <h2 class="text-lg font-semibold text-foreground">Data Processing</h2>
        <p>
          When you make a donation, we process your personal data (name, email, payment details)
          under the legal basis of <strong>contractual necessity</strong> (GDPR Article 6(1)(b)) —
          we need this data to complete your requested transaction. No separate consent checkbox is
          required for donation processing.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-foreground">Gift Aid (UK Donors)</h2>
        <p>
          If you declare Gift Aid, we retain your name, home address, and declaration date as
          required by <strong>HMRC</strong> under our legal obligation (GDPR Article 6(1)(c)). Gift
          Aid records are retained for <strong>6 years</strong> after the last donation covered by
          your declaration, as required by UK tax law.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-foreground">Marketing Communications</h2>
        <p>
          We will only send marketing emails if you explicitly opt in. You can unsubscribe at any
          time. Your consent is recorded with a timestamp and the exact wording shown to you.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-foreground">Your Rights</h2>
        <ul class="list-disc space-y-1 pl-5">
          <li><strong>Access:</strong> Download all your personal data from the Donor Portal.</li>
          <li><strong>Rectification:</strong> Contact us to correct any inaccurate data.</li>
          <li>
            <strong>Erasure:</strong> Request deletion of your personal data. Financial records
            required by law will be anonymized (donor name and email redacted), not deleted.
          </li>
          <li>
            <strong>Portability:</strong> Export your data in a machine-readable format (JSON).
          </li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-foreground">Data Sales</h2>
        <p>
          <strong>We do not sell, rent, or trade your personal information.</strong> Your data is
          used solely for processing donations, issuing receipts, and (with your consent) sending
          updates about our impact.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-foreground">Data Retention</h2>
        <p>
          Donation transaction records are retained permanently for financial auditing. Receipts and
          certificates are generated as immutable PDF documents at the time of donation. If you
          request data erasure, your personal information is anonymized but financial records remain
          intact as required by law.
        </p>
      </section>
    </div>
  </div>
</template>
