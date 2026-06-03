export type ChatModel = {
  logo: string;
  title: string;
  model: string;
  slug: string;
  isDefault?: boolean;
  hasReasoning?: boolean;
  contextLength: number;
};

export const CHAT_MODELS: ChatModel[] = [
  {
    logo: 'https://cdn.prod.website-files.com/650c3b59079d92475f37b68f/6798c7d256b428d5c7991fef_66f41918314a4184b51788ed_meta-logo.png',
    title: 'GLM 4.7',
    slug: 'zai-glm-4.7',
    model: 'zai-glm-4.7',
    isDefault: true,
    contextLength: 131072,
  },
];
