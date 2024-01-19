import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'

/**
 * Servicio encargado de proporcionar funciones relacionadas con el cifrado de contraseñas mediante el algoritmo bcrypt.
 *
 * Este servicio utiliza la biblioteca bcryptjs para realizar operaciones de cifrado y verificación de contraseñas.
 */
@Injectable()
export class BcryptService {
  private ROUNDS = 12

  /**
   * Genera un hash cifrado de una contraseña utilizando el algoritmo bcrypt.
   *
   * @param {string} password - Contraseña a cifrar.
   * @returns {Promise<string>} - Hash cifrado de la contraseña.
   */
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.ROUNDS)
  }

  /**
   * Compara una contraseña con su hash cifrado para verificar si coinciden.
   *
   * @param {string} password - Contraseña a comparar.
   * @param {string} hash - Hash cifrado de la contraseña.
   * @returns {Promise<boolean>} - Verdadero si la contraseña coincide con el hash cifrado, falso de lo contrario.
   */
  async isMatch(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  }
}
