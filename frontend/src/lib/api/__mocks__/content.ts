export const contentService = {
  getContent: jest.fn().mockResolvedValue({
    data: [
      {
        id: 1,
        title: 'Banking Fundamentals',
        description: 'Introduction to banking principles',
        price: 2500,
        type: 'document',
        category: 'exam_text',
        is_active: true,
      },
      {
        id: 2,
        title: 'Risk Management',
        description: 'Advanced risk management techniques',
        price: 5000,
        type: 'video',
        category: 'research_paper',
        is_active: true,
      },
    ],
  }),
  getContentById: jest.fn().mockResolvedValue({
    data: {
      id: 1,
      title: 'Banking Fundamentals',
      description: 'Introduction to banking principles',
      price: 2500,
      type: 'document',
      category: 'exam_text',
      is_active: true,
    },
  }),
  createContent: jest.fn().mockResolvedValue({}),
  updateContent: jest.fn().mockResolvedValue({}),
  deleteContent: jest.fn().mockResolvedValue({}),
}
