export function timeAgo(date: Date | string): string {
  const inputDate = typeof date === 'string' ? new Date(date) : date;

  if (!(inputDate instanceof Date) || isNaN(inputDate.getTime())) {
    throw new Error('Invalid date provided');
  }

  const now = new Date();
  const seconds = Math.floor((now.getTime() - inputDate.getTime()) / 1000);

  if (seconds < 0) {
    return "in the future";
  }

  const intervals = [
    { seconds: 60, text: 'second' },
    { seconds: 3600, text: 'minute' },
    { seconds: 86400, text: 'hour' },
    { seconds: 2592000, text: 'day' },
    { seconds: 31536000, text: 'month' },
    { seconds: Infinity, text: 'year' }
  ];

  for (let i = 0; i < intervals.length; i++) {
    const interval = intervals[i];
    if (seconds < interval.seconds) {
      const divisor = i ? intervals[i-1].seconds : 1;
      const count = Math.floor(seconds / divisor);
      return `${count} ${interval.text}${count !== 1 ? 's' : ''} ago`;
    }
  }

  return 'a long time ago';
}



export function getTenMinutes(): Date {
  return new Date(Date.now() + 10 * 60 * 1000);
}
