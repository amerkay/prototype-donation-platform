<template>
  <ESection>
    <table
      align="center"
      width="100%"
      role="presentation"
      cellspacing="0"
      cellpadding="0"
      border="0"
    >
      <tbody>
        <tr>
          <td style="padding: 8px 0; vertical-align: top">
            <table
              class="email-card-shell"
              align="center"
              width="100%"
              role="presentation"
              cellspacing="0"
              cellpadding="0"
              border="0"
              style="border: 1px solid #c7c7c7; border-radius: 12px; border-collapse: separate"
            >
              <tbody>
                <tr>
                  <td style="padding: 0; vertical-align: top">
                    <slot />
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </ESection>
</template>
