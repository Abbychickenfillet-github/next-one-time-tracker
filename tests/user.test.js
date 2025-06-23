import {
  getUsers,
  // getUserById
} from '../services/user.service.js'

describe('getUsers', () => {
  it('should return data object', async () => {
    const result = await getUsers()
    expect(result).toEqual(
      expect.objectContaining({
        status: expect.toBeOneOf(['success', 'error']),
        message: expect.any(String),
        payload: expect.any(Object),
      })
    )
  })
})
