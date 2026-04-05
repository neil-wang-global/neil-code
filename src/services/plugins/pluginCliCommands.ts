/**
 * CLI command wrappers for plugin operations
 *
 * This module provides thin wrappers around the core plugin operations
 * that handle CLI-specific concerns like console output and process exit.
 *
 * For the core operations (without CLI side effects), see pluginOperations.ts
 */
import figures from 'figures'
import { errorMessage } from '../../utils/errors.js'
import { gracefulShutdown } from '../../utils/gracefulShutdown.js'
import { logError } from '../../utils/log.js'
import type { PluginScope } from '../../utils/plugins/schemas.js'
import { writeToStdout } from '../../utils/process.js'
import {
  disableAllPluginsOp,
  disablePluginOp,
  enablePluginOp,
  type InstallableScope,
  installPluginOp,
  uninstallPluginOp,
  updatePluginOp,
  VALID_INSTALLABLE_SCOPES,
  VALID_UPDATE_SCOPES,
} from './pluginOperations.js'

export { VALID_INSTALLABLE_SCOPES, VALID_UPDATE_SCOPES }

type PluginCliCommand =
  | 'install'
  | 'uninstall'
  | 'enable'
  | 'disable'
  | 'disable-all'
  | 'update'

/**
 * Generic error handler for plugin CLI commands. Emits
 * tengu_plugin_command_failed before exit so dashboards can compute a
 * success rate against the corresponding success events.
 */
function handlePluginCommandError(
  error: unknown,
  command: PluginCliCommand,
  plugin?: string,
): never {
  logError(error)
  const operation = plugin
    ? `${command} plugin "${plugin}"`
    : command === 'disable-all'
      ? 'disable all plugins'
      : `${command} plugins`
  // biome-ignore lint/suspicious/noConsole:: intentional console output
  console.error(
    `${figures.cross} Failed to ${operation}: ${errorMessage(error)}`,
  )
  // eslint-disable-next-line custom-rules/no-process-exit
  process.exit(1)
}

/**
 * CLI command: Install a plugin non-interactively
 * @param plugin Plugin identifier (name or plugin@marketplace)
 * @param scope Installation scope: user, project, or local (defaults to 'user')
 */
export async function installPlugin(
  plugin: string,
  scope: InstallableScope = 'user',
): Promise<void> {
  try {
    // biome-ignore lint/suspicious/noConsole:: intentional console output
    console.log(`Installing plugin "${plugin}"...`)

    const result = await installPluginOp(plugin, scope)

    if (!result.success) {
      throw new Error(result.message)
    }

    // biome-ignore lint/suspicious/noConsole:: intentional console output
    console.log(`${figures.tick} ${result.message}`)

    // eslint-disable-next-line custom-rules/no-process-exit
    process.exit(0)
  } catch (error) {
    handlePluginCommandError(error, 'install', plugin)
  }
}

/**
 * CLI command: Uninstall a plugin non-interactively
 * @param plugin Plugin name or plugin@marketplace identifier
 * @param scope Uninstall from scope: user, project, or local (defaults to 'user')
 */
export async function uninstallPlugin(
  plugin: string,
  scope: InstallableScope = 'user',
  keepData = false,
): Promise<void> {
  try {
    const result = await uninstallPluginOp(plugin, scope, !keepData)

    if (!result.success) {
      throw new Error(result.message)
    }

    // biome-ignore lint/suspicious/noConsole:: intentional console output
    console.log(`${figures.tick} ${result.message}`)

    // eslint-disable-next-line custom-rules/no-process-exit
    process.exit(0)
  } catch (error) {
    handlePluginCommandError(error, 'uninstall', plugin)
  }
}

/**
 * CLI command: Enable a plugin non-interactively
 * @param plugin Plugin name or plugin@marketplace identifier
 * @param scope Optional scope. If not provided, finds the most specific scope for the current project.
 */
export async function enablePlugin(
  plugin: string,
  scope?: InstallableScope,
): Promise<void> {
  try {
    const result = await enablePluginOp(plugin, scope)

    if (!result.success) {
      throw new Error(result.message)
    }

    // biome-ignore lint/suspicious/noConsole:: intentional console output
    console.log(`${figures.tick} ${result.message}`)

    // eslint-disable-next-line custom-rules/no-process-exit
    process.exit(0)
  } catch (error) {
    handlePluginCommandError(error, 'enable', plugin)
  }
}

/**
 * CLI command: Disable a plugin non-interactively
 * @param plugin Plugin name or plugin@marketplace identifier
 * @param scope Optional scope. If not provided, finds the most specific scope for the current project.
 */
export async function disablePlugin(
  plugin: string,
  scope?: InstallableScope,
): Promise<void> {
  try {
    const result = await disablePluginOp(plugin, scope)

    if (!result.success) {
      throw new Error(result.message)
    }

    // biome-ignore lint/suspicious/noConsole:: intentional console output
    console.log(`${figures.tick} ${result.message}`)

    // eslint-disable-next-line custom-rules/no-process-exit
    process.exit(0)
  } catch (error) {
    handlePluginCommandError(error, 'disable', plugin)
  }
}

/**
 * CLI command: Disable all enabled plugins non-interactively
 */
export async function disableAllPlugins(): Promise<void> {
  try {
    const result = await disableAllPluginsOp()

    if (!result.success) {
      throw new Error(result.message)
    }

    // biome-ignore lint/suspicious/noConsole:: intentional console output
    console.log(`${figures.tick} ${result.message}`)

    // eslint-disable-next-line custom-rules/no-process-exit
    process.exit(0)
  } catch (error) {
    handlePluginCommandError(error, 'disable-all')
  }
}

/**
 * CLI command: Update a plugin non-interactively
 * @param plugin Plugin name or plugin@marketplace identifier
 * @param scope Scope to update
 */
export async function updatePluginCli(
  plugin: string,
  scope: PluginScope,
): Promise<void> {
  try {
    writeToStdout(
      `Checking for updates for plugin "${plugin}" at ${scope} scope…\n`,
    )

    const result = await updatePluginOp(plugin, scope)

    if (!result.success) {
      throw new Error(result.message)
    }

    writeToStdout(`${figures.tick} ${result.message}\n`)

    await gracefulShutdown(0)
  } catch (error) {
    handlePluginCommandError(error, 'update', plugin)
  }
}
