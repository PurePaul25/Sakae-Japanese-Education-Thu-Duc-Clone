import { ASSETS } from '../../constants/assets';

const FloatingContact = () => {
    const zaloUrl = 'https://zalo.me/0945716530';
    const messengerUrl = 'https://m.me/107525079044139';

    return (
        <div className="fixed bottom-28 z-50 flex flex-col items-center gap-4 sm:right-6.5 right-4.5">
            {/* Zalo */}
            <a
                href={zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Liên hệ với Sakae qua Zalo"
                className="group relative"
            >
                {/* Tooltip - Desktop only */}
                <span
                    className="
                        pointer-events-none
                        absolute right-full top-1/2 mr-3
                        hidden -translate-y-1/2
                        whitespace-nowrap
                        rounded-lg bg-red-500
                        px-3 py-2
                        text-sm font-bold text-white
                        opacity-0 shadow-lg
                        transition-all duration-300
                        sm:block
                        group-hover:translate-x-0
                        group-hover:opacity-100
                    "
                >
                    Chat Zalo với Sakae
                </span>

                {/* Tooltip arrow */}
                <span
                    className="
                        pointer-events-none
                        absolute right-full top-1/2 mr-1
                        hidden h-2 w-2
                        -translate-y-1/2 translate-x-1/2
                        rotate-45
                        bg-red-500
                        opacity-0
                        transition-opacity duration-300
                        sm:block
                        group-hover:opacity-100
                    "
                />

                {/* Ripple */}
                <span
                    className="
                        absolute inset-0
                        rounded-full
                        bg-blue-500/30
                        animate-ping
                    "
                />

                {/* Button */}
                <div
                    className="
                        relative flex h-14 w-14
                        items-center justify-center
                        overflow-hidden rounded-full
                        bg-white p-2
                        shadow-lg ring-1 ring-black/5
                        transition-all duration-300
                        group-hover:scale-110
                        group-hover:shadow-xl
                        animate-messenger-shake
                        sm:h-14 sm:w-14
                    "
                >
                    <img src={ASSETS.ICONS.ZALO} alt="Zalo" className="h-full w-full object-contain" />
                </div>
            </a>

            {/* Messenger */}
            <a
                href={messengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat với Sakae qua Messenger"
                className="group relative"
            >
                {/* Tooltip - Desktop only */}
                <span
                    className="
                        pointer-events-none
                        absolute right-full top-1/2 mr-3
                        hidden -translate-y-1/2
                        whitespace-nowrap
                        rounded-lg bg-red-500
                        px-3 py-2
                        text-sm font-bold text-white
                        opacity-0 shadow-lg
                        transition-all duration-300
                        sm:block
                        group-hover:opacity-100
                    "
                >
                    Chat qua Messenger
                </span>

                {/* Tooltip arrow */}
                <span
                    className="
                        pointer-events-none
                        absolute right-full top-1/2 mr-1
                        hidden h-2 w-2
                        -translate-y-1/2 translate-x-1/2
                        rotate-45
                        bg-red-600
                        opacity-0
                        transition-opacity duration-300
                        sm:block
                        group-hover:opacity-100
                    "
                />

                {/* Ripple */}
                <span
                    className="
                        absolute inset-0
                        rounded-full
                        border-2 border-blue-400/50
                        animate-zalo-ripple
                    "
                />

                {/* Button */}
                <div
                    className="
                        relative flex h-14 w-14
                        items-center justify-center
                        overflow-hidden rounded-full
                        bg-white p-2
                        shadow-lg ring-1 ring-black/5
                        transition-all duration-300
                        group-hover:scale-110
                        group-hover:shadow-xl
                    "
                >
                    <img src={ASSETS.ICONS.MESSENGER} alt="Messenger" className="h-full w-full object-contain" />
                </div>
            </a>
        </div>
    );
};

export default FloatingContact;
