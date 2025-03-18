export const chatSchema = {
	type: 'object',
	properties: {
		steps: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					heading: { type: 'string' },
					explanation: { type: 'string' },
					output: { type: 'string' },
				},
				required: ['heading', 'explanation', 'output'],
				additionalProperties: false,
			},
		},
		final_answer: { type: 'string' },
		illustrationUrl: { type: 'string' },
	},
	required: ['steps', 'final_answer'],
	additionalProperties: false,
}
