
interface TicketListHeaderProps {
  selectedDepartment: string;
  ticketCount: number;
}

const TicketListHeader = ({ selectedDepartment, ticketCount }: TicketListHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">
        {selectedDepartment === 'all' ? 'All Tickets' : `${selectedDepartment} Department Tickets`}
      </h2>
      <span className="text-sm text-gray-500">
        {ticketCount} ticket{ticketCount !== 1 ? 's' : ''}
      </span>
    </div>
  );
};

export default TicketListHeader;
