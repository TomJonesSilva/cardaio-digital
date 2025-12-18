import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { cookieExtractor } from './cookie-extractor';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('❌ JWT_SECRET não definido nas variáveis de ambiente.');
    }

    super({
      jwtFromRequest: (req: Request) => cookieExtractor(req),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    // Aqui você pode adicionar verificações extras, se quiser (ex: usuário ainda existe)
    return {
      telefone: payload.telefone,
      tipo_user: payload.tipo_user,
      nome: payload.nome,
    };
  }
}
