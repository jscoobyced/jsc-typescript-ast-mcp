import * as dotenv from 'dotenv'
import { Project } from 'ts-morph'
dotenv.config()

export const createProject = () => {
  const tsConfigFilePath = process.env.PROJECT_TSCONFIG_PATH || 'tsconfig.json'
  console.error(`Using tsconfig file at: ${tsConfigFilePath}`)
  return new Project({
    tsConfigFilePath,
  })
}
