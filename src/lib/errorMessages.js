/**
 * Maps English API error messages to Portuguese (pt-BR) translations.
 * Used by frontend components to display user-friendly error messages.
 */
const ERROR_TRANSLATIONS = {
  // Auth
  "Authentication required": "Autenticação necessária.",
  "Invalid or expired token": "Token inválido ou expirado.",
  "Invalid credentials": "Email ou senha inválidos.",
  "Email verification required": "Verificação de email necessária.",
  "Invalid refresh token": "Sessão expirada. Faça login novamente.",
  "Refresh token expired": "Sessão expirada. Faça login novamente.",
  "Refresh token is required": "Sessão expirada. Faça login novamente.",
  Forbidden: "Acesso negado.",
  "Forbidden: insufficient permissions":
    "Acesso negado: permissões insuficientes.",
  "Forbidden: origin not allowed": "Acesso negado: origem não permitida.",

  // User
  "User not found": "Usuário não encontrado.",
  "Password is required": "A senha é obrigatória.",
  "Email or username is required": "Email ou nome de usuário é obrigatório.",
  "Invalid email format": "Formato de email inválido.",
  "A user with this email already exists":
    "Já existe um usuário com este email.",
  "A user with this username already exists":
    "Já existe um usuário com este nome de usuário.",
  "Username is required": "O nome de usuário é obrigatório.",
  "Failed to generate a unique username":
    "Falha ao gerar um nome de usuário único.",
  "Registration session expired. Please try again.":
    "Sessão de registro expirada. Tente novamente.",
  "Invalid registration token.": "Token de registro inválido.",
  "Account has no email address to verify":
    "A conta não possui email para verificar.",

  // Password
  "Password must contain at least one number":
    "A senha deve conter pelo menos um número.",
  "Password must contain at least one symbol":
    "A senha deve conter pelo menos um símbolo.",

  // Email verification
  "Email already verified": "Email já verificado.",
  "Verification token not found": "Token de verificação não encontrado.",
  "Token has expired": "Token expirado.",
  "token is required": "Token é obrigatório.",
  "Invalid university email format": "Formato de email institucional inválido.",

  // University
  "University not found": "Universidade não encontrada.",
  "Name is required": "O nome é obrigatório.",
  "Location is required": "A localização é obrigatória.",
  "Type is required": "O tipo é obrigatório.",
  "Type must be PUBLIC or PRIVATE": "O tipo deve ser PÚBLICA ou PARTICULAR.",
  "A university with this name already exists":
    "Já existe uma universidade com este nome.",
  "Request body must be a non-empty array":
    "O corpo da requisição deve ser um array não vazio.",

  // Review
  "Review not found": "Avaliação não encontrada.",
  "comment is required": "O comentário é obrigatório.",
  "universityId is required": "A universidade é obrigatória.",
  "Rating must be an integer between 1 and 5":
    "A nota deve ser um número inteiro entre 1 e 5.",
  "Difficulty level must be an integer between 1 and 5":
    "O nível de dificuldade deve ser um número inteiro entre 1 e 5.",

  // Course
  "Course not found": "Curso não encontrado.",
  "title is required": "O título é obrigatório.",
  "description is required": "A descrição é obrigatória.",
  "link is required": "O link é obrigatório.",

  // University submission
  "Submission not found": "Sugestão não encontrada.",
  "Only pending submissions can be approved":
    "Apenas sugestões pendentes podem ser aprovadas.",
  "Only pending submissions can be rejected":
    "Apenas sugestões pendentes podem ser rejeitadas.",
  "Reason is required for rejection": "O motivo da rejeição é obrigatório.",

  // University email
  "universityEmail is required": "O email institucional é obrigatório.",

  // Rate limit
  "Too many requests, please try again later.":
    "Muitas tentativas. Tente novamente mais tarde.",

  // Google auth
  "Google account must have a verified email address":
    "A conta Google deve ter um email verificado.",
  "No account found with this Google email. Please register first.":
    "Nenhuma conta encontrada com esse email Google. Cadastre-se primeiro.",
};

/**
 * Translates an API error message to Portuguese.
 * Falls back to the provided fallback or the original message.
 *
 * @param {string} message - The English error message from the API
 * @param {string} [fallback] - Optional PT-BR fallback if no translation found
 * @returns {string} The translated message
 */
export function translateError(message, fallback) {
  if (!message) return fallback || "Ocorreu um erro inesperado.";

  // Check for exact match
  if (ERROR_TRANSLATIONS[message]) {
    return ERROR_TRANSLATIONS[message];
  }

  // Check for partial matches (e.g., dynamic messages with variable lengths)
  if (message.startsWith("Password must be at least")) {
    const chars = message.match(/\d+/)?.[0];
    return `A senha deve ter pelo menos ${chars} caracteres.`;
  }
  if (message.startsWith("Password must be at most")) {
    const chars = message.match(/\d+/)?.[0];
    return `A senha deve ter no máximo ${chars} caracteres.`;
  }
  if (message.startsWith("Password must contain at least one uppercase")) {
    return "A senha deve conter pelo menos uma letra maiúscula.";
  }
  if (message.startsWith("Password must contain at least one lowercase")) {
    return "A senha deve conter pelo menos uma letra minúscula.";
  }
  if (message.startsWith("comment must be at least")) {
    const chars = message.match(/\d+/)?.[0];
    return `O comentário deve ter pelo menos ${chars} caracteres.`;
  }
  if (message.startsWith("comment must be at most")) {
    const chars = message.match(/\d+/)?.[0];
    return `O comentário deve ter no máximo ${chars} caracteres.`;
  }
  if (message.startsWith("Username must be")) {
    return "O nome de usuário deve ter entre 3 e 20 caracteres e conter apenas letras, números e underscore.";
  }

  return fallback || message;
}
