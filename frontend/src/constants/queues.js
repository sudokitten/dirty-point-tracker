export const QUEUE_MAP = {
  420: 'Ranked Solo',
  440: 'Ranked Flex',
  400: 'Draft Pick',
  430: 'Blind Pick',
  450: 'ARAM',
  700: 'Clash'
};

export const getQueueName = (queueId) => QUEUE_MAP[queueId] || 'Normal';
