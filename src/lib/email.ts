import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Email templates
const emailTemplates = {
  welcome: {
    subject: 'Bem-vindo à Xpecial!',
    html: (name: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Bem-vindo à Xpecial!</h1>
        </div>
        <div style="padding: 40px 20px; background: #f8fafc;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Olá, ${name}!</h2>
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            É um prazer tê-lo(a) conosco! A Xpecial é uma plataforma dedicada a conectar talentos únicos 
            com oportunidades especiais no mercado de trabalho.
          </p>
          <p style="color: #475569; line-height: 1.6; margin-bottom: 30px;">
            Agora você pode:
          </p>
          <ul style="color: #475569; line-height: 1.8; margin-bottom: 30px;">
            <li>Explorar vagas inclusivas de empresas comprometidas com a diversidade</li>
            <li>Participar de cursos online gratuitos com certificados reconhecidos</li>
            <li>Conectar-se com uma comunidade inclusiva e acolhedora</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/candidato" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Acessar Minha Conta
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            Se você tiver alguma dúvida, nossa equipe está sempre pronta para ajudar em contato@xpecial.com
          </p>
        </div>
        <div style="background: #1e293b; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 14px;">
            © 2024 Xpecial. Todos os direitos reservados.
          </p>
        </div>
      </div>
    `,
  },
  
  jobApplication: {
    subject: 'Nova candidatura recebida - Xpecial',
    html: (candidateName: string, jobTitle: string, companyName: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Nova Candidatura!</h1>
        </div>
        <div style="padding: 40px 20px; background: #f8fafc;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Olá, ${companyName}!</h2>
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Você recebeu uma nova candidatura através da plataforma Xpecial.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #059669; margin: 20px 0;">
            <h3 style="color: #1e293b; margin: 0 0 10px 0;">Detalhes da Candidatura:</h3>
            <p style="margin: 5px 0; color: #475569;"><strong>Candidato:</strong> ${candidateName}</p>
            <p style="margin: 5px 0; color: #475569;"><strong>Vaga:</strong> ${jobTitle}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/empresa/candidaturas" 
               style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Ver Candidatura
            </a>
          </div>
        </div>
        <div style="background: #1e293b; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 14px;">
            © 2024 Xpecial. Todos os direitos reservados.
          </p>
        </div>
      </div>
    `,
  },
  
  courseCompletion: {
    subject: 'Parabéns! Você concluiu um curso na Xpecial',
    html: (name: string, courseName: string, certificateNumber: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Parabéns!</h1>
        </div>
        <div style="padding: 40px 20px; background: #f8fafc;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Olá, ${name}!</h2>
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Parabéns por concluir com sucesso o curso <strong>${courseName}</strong>!
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #7c3aed; margin: 20px 0;">
            <h3 style="color: #1e293b; margin: 0 0 10px 0;">Seu Certificado:</h3>
            <p style="margin: 5px 0; color: #475569;"><strong>Número:</strong> ${certificateNumber}</p>
            <p style="margin: 5px 0; color: #475569;"><strong>Curso:</strong> ${courseName}</p>
          </div>
          <p style="color: #475569; line-height: 1.6; margin-bottom: 30px;">
            Seu certificado já está disponível para download e pode ser validado por qualquer pessoa 
            usando o número acima em nossa página de validação.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/candidato/certificados" 
               style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
              Baixar Certificado
            </a>
            <a href="${process.env.NEXTAUTH_URL}/validar-certificado" 
               style="background: #64748b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Validar Certificado
            </a>
          </div>
        </div>
        <div style="background: #1e293b; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 14px;">
            © 2024 Xpecial. Todos os direitos reservados.
          </p>
        </div>
      </div>
    `,
  },
  
  passwordReset: {
    subject: 'Redefinição de senha - Xpecial',
    html: (name: string, resetToken: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Redefinir Senha</h1>
        </div>
        <div style="padding: 40px 20px; background: #f8fafc;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Olá, ${name}!</h2>
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Você solicitou a redefinição de sua senha na Xpecial. Clique no botão abaixo para criar uma nova senha:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}" 
               style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Redefinir Senha
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            Este link expira em 1 hora. Se você não solicitou esta redefinição, ignore este email.
          </p>
        </div>
        <div style="background: #1e293b; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 14px;">
            © 2024 Xpecial. Todos os direitos reservados.
          </p>
        </div>
      </div>
    `,
  },

  emailVerification: {
    subject: 'Ative sua conta na Xpecial',
    html: (name: string, verificationToken: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Ative sua conta!</h1>
        </div>
        <div style="padding: 40px 20px; background: #f8fafc;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Olá, ${name}!</h2>
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Obrigado por se cadastrar na Xpecial! Para completar seu cadastro e ativar sua conta, 
            clique no botão abaixo:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/ativar-conta?token=${verificationToken}" 
               style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Ativar Minha Conta
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            Este link expira em 24 horas. Se você não se cadastrou na Xpecial, ignore este email.
          </p>
          <p style="color: #475569; line-height: 1.6; margin-top: 20px;">
            Após ativar sua conta, você poderá:
          </p>
          <ul style="color: #475569; line-height: 1.8; margin-bottom: 20px;">
            <li>Explorar vagas inclusivas</li>
            <li>Participar de cursos gratuitos</li>
            <li>Conectar-se com empresas</li>
          </ul>
        </div>
        <div style="background: #1e293b; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 14px;">
            © 2024 Xpecial. Todos os direitos reservados.
          </p>
        </div>
      </div>
    `,
  },

  temporaryPassword: {
    subject: 'Senha temporária - Xpecial',
    html: (name: string, temporaryPassword: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb, #4f46e5, #7c3aed); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔑 Senha Temporária</h1>
        </div>
        <div style="padding: 40px 20px; background: #f8fafc;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Olá, ${name}!</h2>
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Você solicitou a recuperação de sua senha na Xpecial. Criamos uma senha temporária para você acessar sua conta.
          </p>
          
          <div style="background: white; padding: 25px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 25px 0; text-align: center;">
            <h3 style="color: #1e293b; margin: 0 0 15px 0;">Sua Senha Temporária:</h3>
            <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #1e293b; letter-spacing: 2px;">
              ${temporaryPassword}
            </div>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 25px 0;">
            <h3 style="color: #92400e; margin: 0 0 15px 0;">⚠️ Instruções Importantes:</h3>
            <ol style="color: #92400e; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li><strong>Faça login</strong> na plataforma usando esta senha temporária</li>
              <li><strong>Acesse seu perfil</strong> através do menu principal</li>
              <li><strong>Altere sua senha</strong> imediatamente por uma nova senha segura</li>
              <li><strong>Esta senha temporária expira em 24 horas</strong></li>
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/login" 
               style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin-right: 10px;">
              Fazer Login
            </a>
            <a href="${process.env.NEXTAUTH_URL}/configuracoes" 
               style="background: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Ir para Perfil
            </a>
          </div>

          <p style="color: #64748b; font-size: 14px; margin-top: 30px; text-align: center;">
            <strong>Dica de Segurança:</strong> Escolha uma senha forte com pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.
          </p>
        </div>
        <div style="background: #1e293b; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 14px;">
            © 2024 Xpecial. Todos os direitos reservados.
          </p>
        </div>
      </div>
    `,
  },
};

// Email sending functions
export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    await transporter.sendMail({
      from: `"Xpecial" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: emailTemplates.welcome.subject,
      html: emailTemplates.welcome.html(name),
    });
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

export const sendJobApplicationEmail = async (
  companyEmail: string,
  candidateName: string,
  jobTitle: string,
  companyName: string
) => {
  try {
    await transporter.sendMail({
      from: `"Xpecial" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: companyEmail,
      subject: emailTemplates.jobApplication.subject,
      html: emailTemplates.jobApplication.html(candidateName, jobTitle, companyName),
    });
    console.log(`Job application email sent to ${companyEmail}`);
  } catch (error) {
    console.error('Error sending job application email:', error);
    throw error;
  }
};

export const sendCourseCompletionEmail = async (
  email: string,
  name: string,
  courseName: string,
  certificateNumber: string
) => {
  try {
    await transporter.sendMail({
      from: `"Xpecial" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: emailTemplates.courseCompletion.subject,
      html: emailTemplates.courseCompletion.html(name, courseName, certificateNumber),
    });
    console.log(`Course completion email sent to ${email}`);
  } catch (error) {
    console.error('Error sending course completion email:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetToken: string
) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: emailTemplates.passwordReset.subject,
      html: emailTemplates.passwordReset.html(name, resetToken),
    });
    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar email de redefinição de senha:', error);
    return { success: false, error };
  }
};

export const sendEmailVerification = async (
  email: string,
  name: string,
  verificationToken: string
) => {
  try {
    await transporter.sendMail({
      from: `"Xpecial" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: emailTemplates.emailVerification.subject,
      html: emailTemplates.emailVerification.html(name, verificationToken),
    });
    console.log(`Email verification sent to ${email}`);
  } catch (error) {
    console.error('Error sending email verification:', error);
    throw error;
  }
};

export const sendTemporaryPasswordEmail = async (
  email: string,
  name: string,
  temporaryPassword: string
) => {
  try {
    await transporter.sendMail({
      from: `"Xpecial" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: emailTemplates.temporaryPassword.subject,
      html: emailTemplates.temporaryPassword.html(name, temporaryPassword),
    });
    console.log(`Temporary password email sent to ${email}`);
  } catch (error) {
    console.error('Error sending temporary password email:', error);
    throw error;
  }
};

// Função para gerar token de verificação único
export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Função para calcular data de expiração (24 horas)
export const getVerificationTokenExpiry = (): Date => {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  return expiry;
};

// Verify email configuration
export const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};