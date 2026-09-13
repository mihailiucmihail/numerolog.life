import { z } from 'zod'
import { checkoutEmailSchema, missingIdentityFields, progressiveIdentitySchema, type IdentityField, type ProgressiveIdentity } from './progressive-input'

export interface IdentityCompletionRequest {
  fields: readonly IdentityField[]
  requireEmail: boolean
  includeMiddle?: boolean
}

export interface IdentityCompletion extends ProgressiveIdentity {
  email?: string
}

export function identityCompletionSchema(request: IdentityCompletionRequest) {
  return progressiveIdentitySchema.extend({
    email: z.preprocess(value => typeof value === 'string' && !value.trim() ? undefined : value, checkoutEmailSchema.optional()),
  }).superRefine((value, context) => {
    for (const field of missingIdentityFields(value, request.fields)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: 'required_identity_field' })
    }
    if (request.requireEmail && !value.email) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['email'], message: 'required_checkout_email' })
    }
  })
}

export function mergeIdentityCompletion(current: IdentityCompletion, patch: IdentityCompletion): IdentityCompletion {
  return identityCompletionSchema({ fields: [], requireEmail: false }).parse({ ...current, ...patch })
}

export const FULL_CRYSTAL_IDENTITY_REQUEST = {
  fields: ['last', 'first', 'gender'],
  includeMiddle: true,
  requireEmail: true,
} as const satisfies IdentityCompletionRequest
