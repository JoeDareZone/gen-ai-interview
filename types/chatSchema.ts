export const chatSchema = {
	type: 'object',
	properties: {
		steps: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					explanation: { type: 'string' },
					output: { type: 'string' },
				},
				required: ['explanation', 'output'],
				additionalProperties: false,
			},
		},
		final_answer: { type: 'string' },
		illustrationUrl: { type: 'string' },
	},
	required: ['steps', 'final_answer'],
	additionalProperties: false,
}
