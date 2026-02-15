<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  name: string
  description: string
  imageUrl?: string
}

const props = defineProps<Props>()

const shortDescription = computed(() =>
  props.description.length > 60 ? `${props.description.slice(0, 60)}...` : props.description
)
</script>

<template>
  <ESection style="padding: 8px 0">
    <table
      align="center"
      width="100%"
      role="presentation"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="
        border: 1px solid rgba(128, 128, 128, 0.3);
        border-radius: 8px;
        background-color: rgba(200, 200, 200, 0.1);
        border-collapse: separate;
      "
    >
      <tbody>
        <tr>
          <td
            v-if="imageUrl"
            width="62"
            style="padding: 12px 0 12px 12px; vertical-align: top; box-sizing: content-box"
          >
            <img
              :src="imageUrl"
              :alt="name"
              width="48"
              height="48"
              style="
                width: 48px;
                height: 48px;
                border-radius: 6px;
                object-fit: cover;
                display: block;
              "
            />
          </td>
          <td style="padding: 12px 12px 12px 0; vertical-align: top">
            <p style="font-size: 14px; line-height: 20px; margin: 0; font-weight: 600">
              {{ name }}
            </p>
            <p style="font-size: 12px; line-height: 18px; margin: 4px 0 0; opacity: 0.9">
              {{ shortDescription }}
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  </ESection>
</template>
