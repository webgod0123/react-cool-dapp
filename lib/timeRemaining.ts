export const getTimeRemaining = (endtime: string) => {
  return getTime(new Date().toString(), endtime)
}

export const getTimePassed = (startTime: string) => {
  return getTime(startTime, new Date().toString(), true)
}

export const getTime = (starttime: string, endtime: string, passed?: boolean) => {
  const total = Date.parse(endtime) - Date.parse(starttime)
  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))

  let str = ''

  if (days > 0) str = `${days} days`
  if (days === 0 && hours > 0) str = `${hours} hours`
  if (days === 0 && hours === 0 && minutes > 0) str = `${minutes} minutes`

  if (passed) str = `${str} ago`

  return str
}
