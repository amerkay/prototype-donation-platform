<template>
  <ESection style="padding: 12px 0">
    <table
      align="center"
      width="100%"
      role="presentation"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="
        border: 1px solid rgba(128, 128, 128, 0.3);
        border-radius: 12px;
        background-color: rgba(128, 128, 128, 0.08);
        border-collapse: separate;
        font-size: 14px;
        line-height: 22px;
      "
    >
      <tbody>
        <tr>
          <td style="padding: 0; vertical-align: top">
            <slot />
          </td>
        </tr>
      </tbody>
    </table>
  </ESection>
</template>
