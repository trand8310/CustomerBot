using CustomerBot.Debugging;

namespace CustomerBot;

public class CustomerBotConsts
{
    public const string LocalizationSourceName = "CustomerBot";

    public const string ConnectionStringName = "Default";

    public const bool MultiTenancyEnabled = true;


    /// <summary>
    /// Default pass phrase for SimpleStringCipher decrypt/encrypt operations
    /// </summary>
    public static readonly string DefaultPassPhrase =
        DebugHelper.IsDebug ? "gsKxGZ012HLL3MI5" : "452cbb454f604721bf5ff4afabb647e8";
}
