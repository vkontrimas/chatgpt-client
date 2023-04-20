const MessageCrypto = require('../../chat/crypto')


const key = 'V0fE2mEeJ5O4puioEBimJzbEeFiwDhC3'
const crypto = new MessageCrypto(key)

const plainText = `Yes, here is a simple hello world program in C++:
#include <iostream>

int main() {
    std::cout << "Hello, world!\n";
    return 0;
}
Explanation:

#include <iostream>: This line includes the iostream header file, which contains functions for standard input and output operations.
int main() { and }: These curly braces enclose the code for the main function, which is the entry point for the program.
std::cout << "Hello, world!\n";: This line outputs the string "Hello, world!" to the console using the std::cout object. The << operator is used to insert the string into the output stream, and the \n character is used to add a newline at the end of the output.
return 0;: This line returns an integer value of 0 to the operating system, which indicates that the program has executed successfully.`

describe('Chat crypto', () => {
  test('Output does not contain original', async () => {
    const { ciphertext, iv }  = await crypto.encryptMessage(plainText)
    expect(ciphertext).not.toBe(plainText)
  })

  test('Decrypts to same plaintext', async () => {
    const { ciphertext, iv }  = await crypto.encryptMessage(plainText)
    const result  = await crypto.decryptMessage(ciphertext, iv)
    expect(result).toBe(plainText)
  })
})
