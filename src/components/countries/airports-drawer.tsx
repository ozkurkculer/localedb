'use client';

import * as React from 'react';
import { Plane, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from '@/components/ui/drawer';

import { useMediaQuery } from '@/hooks/use-media-query';
import { ResponsiveDrawer } from '@/components/ui/responsive-drawer';
import { CopyButton } from '@/components/copy-button';
import type { Airport } from '@/types/airport';
import { cn } from '@/lib/utils';

interface AirportsDrawerProps {
    airports: Airport[];
    countryName: string;
}

export function AirportsDrawer({ airports, countryName }: AirportsDrawerProps) {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');

    const filteredAirports = React.useMemo(() => {
        if (!search) return airports;
        const q = search.toLowerCase();
        return airports.filter(
            (a) =>
                a.name.toLowerCase().includes(q) ||
                a.iata?.toLowerCase().includes(q) ||
                a.icao?.toLowerCase().includes(q) ||
                a.region?.toLowerCase().includes(q)
        );
    }, [airports, search]);

    const Header = isDesktop ? SheetHeader : DrawerHeader;
    const Title = isDesktop ? SheetTitle : DrawerTitle;
    const Description = isDesktop ? SheetDescription : DrawerDescription;

    // Trigger Button
    const Trigger = (
        <Button variant="outline" size="sm" className="gap-2">
            <Plane className="h-4 w-4" />
            View all {airports.length} airports
        </Button>
    );

    return (
        <ResponsiveDrawer
            open={open}
            onOpenChange={setOpen}
            trigger={Trigger}
            side="right"
            className={cn(
                "flex flex-col h-full",
                isDesktop ? "w-[400px] sm:w-[540px]" : "max-h-[85vh]"
            )}
        >
            <div className="flex flex-col h-full">
                <Header className="px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                        <Title className="text-xl font-bold">Airports in {countryName}</Title>
                        {!isDesktop && (
                            <DrawerClose asChild>
                                <Button variant="ghost" size="icon" className="-mr-2">
                                    <X className="h-4 w-4" />
                                </Button>
                            </DrawerClose>
                        )}
                    </div>

                    <Description className="text-muted-foreground">
                        {airports.length} airports available. Search by name, IATA, or ICAO code.
                    </Description>

                    <div className="relative mt-4">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search airports..."
                            className="pl-9 bg-muted/50 border-none focus-visible:ring-1"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </Header>

                <div className={cn("flex-1 overflow-y-auto", isDesktop ? "px-6" : "px-4")}>
                    {filteredAirports.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <Plane className="h-12 w-12 mb-4 opacity-20" />
                            <p>No airports found matching "{search}"</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {filteredAirports.map((airport, i) => (
                                <div key={i} className="py-4 hover:bg-muted/30 transition-colors -mx-2 px-2 rounded-lg group">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-foreground truncate">{airport.name}</h3>
                                            <p className="text-sm text-muted-foreground truncate">{airport.region}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {airport.iata && (
                                            <div className="inline-flex items-center gap-1.5 bg-muted/50 border border-border/50 rounded px-2 py-1 transition-colors hover:bg-muted hover:border-border">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">IATA</span>
                                                <code className="text-xs font-mono font-medium">{airport.iata}</code>
                                                <CopyButton
                                                    value={airport.iata}
                                                    label="IATA"
                                                    className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                                                />
                                            </div>
                                        )}
                                        {airport.icao && (
                                            <div className="inline-flex items-center gap-1.5 bg-muted/50 border border-border/50 rounded px-2 py-1 transition-colors hover:bg-muted hover:border-border">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ICAO</span>
                                                <code className="text-xs font-mono text-muted-foreground">{airport.icao}</code>
                                                <CopyButton
                                                    value={airport.icao}
                                                    label="ICAO"
                                                    className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ResponsiveDrawer>
    );
}
